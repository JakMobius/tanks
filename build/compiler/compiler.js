
const babelify = require('babelify')
const browserify = require("browserify")
const incremental = require('browserify-incremental')
const SASS = require("node-sass")
const CompileCache = require("../compilecache")
const JSBuilder = require("../jsbuilder")
const GLSLMinify = require("../glsl-minifier/glsl-minifier")
const Timings = require("../timings")
const resourceify = require("../resourceify")
const aliasify = require("aliasify")
const exorcist = require('exorcist')
const minifyStream = require('minify-stream')
const collapse = require('bundle-collapser/plugin');

const fs = require('fs')
const path = require("path")

const cacheFile = path.resolve(__dirname, '../cache/browserify-cache.json')

class Compiler {

    static externalLibraries = [
        "fs",
        "http",
        "express",
        "express-session",
        "websocket",
        "url",
        "mongodb",
        "chalk",
        "crypto",
        "assert",
        "path",
        "pako",
        "json5",
        "process"
    ]
    static projectDirectory = path.resolve(__dirname, "../..")

    constructor(options) {
        this.options = options

         /**
         * @type {Plugin[]}
         */

        this.plugins = []
        this.babelify = null
        this.resourcify = null
    }

    /**
     * @param plugin {Plugin}
     */
    plugin(plugin) {
        plugin.setCompiler(this)
        this.plugins.push(plugin)
        return this
    }

    static path(s) {
        return path.resolve(this.projectDirectory, s)
    }

    /**
     * @private
     * @param options Compiler options
     * @return {Browserify}
     */
    createCompiler(options) {

        let o = Object.assign({}, incremental.args, {
            paths: [
                Compiler.projectDirectory + "/"
            ],
            extensions: ['.ts'],
            detectGlobals: false
        })

        const compiler = browserify(o, { debug: true })
        incremental(compiler, { cacheFile: options.cacheFile })
        this.resourcify = resourceify()

        this.babelify = babelify.configure({
            plugins: [
                ["module-resolver", {
                    extensions: [".js", ".ts", ".json"],
                    alias: {
                        "src": Compiler.path("src")
                    }
                }],
                "babel-plugin-import-dir",
                ["@babel/plugin-syntax-dynamic-import"],
                ["@babel/plugin-syntax-class-properties"],
                ["@babel/plugin-proposal-class-properties", { loose: true }],
                ["@babel/plugin-transform-typescript"],
                ["transform-dirname-filename"],
                ["@babel/plugin-transform-runtime"],
                ["@babel/plugin-proposal-export-default-from"]
            ],
            "presets": [
                ['@babel/preset-env', {
                    // "debug": true,
                    "targets": "node 7"
                }]
            ],
            sourceMaps: true,
            sourceType: "module",
            extensions: ['.ts', '.js']
        })
        compiler.transform(this.babelify)
        compiler.plugin(collapse)
        compiler.plugin(this.resourcify.plugin)
        //

        for(let library of Compiler.externalLibraries) {
            compiler.external(library)
        }

        compiler.require(options.source, { entry: true })

        return compiler
    }

    list() {
        return new Promise((resolve, reject) => {
            let source = Compiler.path(this.options.source)
            let cacheFile = Compiler.path(this.options.cacheFile)

            this.compiler = this.createCompiler({
                source: source,
                cacheFile: cacheFile
            })

            this.compiler.bundle()
                .on('error', reject)
                .on('finish', async () => {
                    resolve(this.resourcify.entries)
                })
        })
    }

    compile() {
        return new Promise(async (resolve, reject) => {
            Timings.begin("Compiling scripts")

            await CompileCache.createCache()

            let source = Compiler.path(this.options.source)
            let cacheFile = this.options.cacheFile ? Compiler.path(this.options.cacheFile) : null

            this.compiler = this.createCompiler({
                source: source,
                cacheFile: cacheFile
            })

            let compileError = null

            this.result = ""

            // let terserIgnoreList = []
            //
            // for(let libraryName of Compiler.externalLibraries) {
            //     let library = require(libraryName)
            //
            //     for(let key in library) {
            //         terserIgnoreList.push(key)
            //     }
            // }
            //
            // terserIgnoreList = terserIgnoreList.concat([])

            this.compiler.bundle()
                // .pipe(minifyStream({
                //     mangle: {
                //         properties: {
                //             reserved: terserIgnoreList,
                //             keep_quoted: true
                //         }
                //     }
                // }))
                .pipe(exorcist(
                    Compiler.path(this.options.destination + ".map"),
                    null,
                    "../",
                    Compiler.projectDirectory
                ))
                .on('data', (data) => this.result += data)
                .on('error', (error) => {
                    console.error(error.message)
                    if(error.annotated) console.error(error.annotated)
                    compileError = error
                })
                //.pipe(fs.createWriteStream('server.js', 'utf8'))
                .on('end', async () => {
                    Timings.end()
                    if(compileError) {
                        reject(compileError)
                        return
                    }
                    await this.finished()
                    resolve()
                })
        })
    }

    /**
     * @async
     * @private
     * @return {Promise>}
     */

    async finished(src, map) {

        Timings.begin("Reading resources")

        await this.resourcify.readResources()

        Timings.end()

        for(let plugin of this.plugins) {
            await plugin.perform(this.resourcify.resources)
        }
        //
        let destination = Compiler.path(this.options.destination)
        let dirname = path.dirname(destination)
        try {
            await fs.promises.access(dirname)
        } catch(error) {
            await fs.promises.mkdir(dirname, { recursive: true })
        }
        await fs.promises.writeFile(destination, this.result)
    }

    static async clearCache() {
        try {
            await fs.promises.unlink(cacheFile)
        } catch(e) {}
    }
}

module.exports = Compiler