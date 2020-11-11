
const Plugin = require("../plugin")
const SASS = require("node-sass")
const CompileCache = require("../../compilecache")
const JSBuilder = require("../../jsbuilder")
const GLSLMinify = require("../../glsl-minifier/glsl-minifier")
const Timings = require("../../timings")
const Compiler = require("../compiler")

const fs = require('fs')
const path = require("path")

const cacheFile = path.resolve(__dirname, '../cache/browserify-cache.json')

class GLSLPlugin extends Plugin {
    constructor(options) {
        super(options);

        this.placeholder = options.placeholder
    }

    async checkFilePath(entry) {
        try {
            if(!(await fs.promises.stat(entry.resource)).isFile()) {
                console.error("GLSLPlugin failed to load shader because specified path is not a file");
                console.error(this.formatEntryForError(entry));
                return false
            }
        } catch(e) {
            console.error("GLSLPlugin ecountered " + e.code + " while accessing the file");
            console.error(this.formatEntryForError(entry));
            return false
        }

        return true
    }

    formatEntryForError(entry) {
        return  " Requested path: " + path.relative(Compiler.projectDirectory, entry.resource) + "\n" +
                " Caller path:    " + path.relative(Compiler.projectDirectory, entry.caller)
    }

    async perform(resources) {
        Timings.begin("Inlining shaders")

        let files = resources.filter(a => a.resource.endsWith(".glsl"))
        let string = "let files = {}\n"
        let cache = await CompileCache.readCache("glsl-compiler")

        for(let entry of files) {
            let shaderPath = entry.resource
            let relative = shaderPath.substr(Compiler.projectDirectory.length)
            let shaderName = path.basename(shaderPath).split(".")[0]
            let text

            if(!await this.checkFilePath(entry)) continue;

            if (await CompileCache.shouldUpdate(shaderPath, cache)) {
                let isVertex = shaderPath.indexOf("vertex") !== -1

                Timings.begin("Minifying " + (isVertex ? "vertex" : "fragment") + " shader '" + relative + "'")

                let shaderSource = await fs.promises.readFile(shaderPath, 'utf8')
                text = await GLSLMinify(shaderSource, isVertex)
                if(!text.length) {
                    await CompileCache.writeCache("glsl-compiler", cache)

                    console.error("GLSLPlugin could not minify shader. Please, check file syntax")
                    console.error(this.formatEntryForError(entry))
                }
                text = text
                    .replace(/\n/ig, "\\n")
                    .replace(/"/ig, "\\\"")
                    .trim()
                CompileCache.updateFile(shaderPath, cache, text)
            } else {
                Timings.begin("Reading '" + relative + "' from cache")
                text = CompileCache.readCachedFile(shaderPath, cache)
            }

            string += `files['${shaderName}'] = "${text}"\n`

            Timings.end()
        }

        string += "\nmodule.exports = files"

        Timings.begin("Inlining module")

        let base = await fs.promises.readFile(Compiler.path("build/glsl-minifier/base.js"), 'utf8')
        let module = JSBuilder.replace(base, {
            content: string
        })

        await CompileCache.writeCache("glsl-compiler", cache)

        let options = {}
        options[this.placeholder] = module

        this.compiler.result = JSBuilder.replace(this.compiler.result, options)

        Timings.end()
        Timings.end()
    }
}

module.exports = GLSLPlugin