
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

    async perform(resources) {
        Timings.begin("Inlining shaders")

        let files = resources.filter(a => a.endsWith(".glsl"))
        let string = "let files = {}\n"
        let cache = await CompileCache.readCache("glsl-compiler")

        for(let shader of files) {

            let relative = shader.substr(Compiler.projectDirectory.length)
            let shaderName = path.basename(shader).split(".")[0]
            let text

            if (await CompileCache.shouldUpdate(shader, cache)) {
                let isVertex = shader.indexOf("vertex") !== -1

                Timings.begin("Minifying " + (isVertex ? "vertex" : "fragment") + " shader '" + relative + "'")

                let shaderSource = await fs.promises.readFile(shader, 'utf8')
                text = await GLSLMinify(shaderSource, isVertex)
                if(!text.length) {
                    await CompileCache.writeCache("glsl-compiler", cache)
                    throw new Error("Failed to compile " + shader)
                }
                text = text
                    .replace(/\n/ig, "\\n")
                    .replace(/"/ig, "\\\"")
                    .trim()
                CompileCache.updateFile(shader, cache, text)
            } else {
                Timings.begin("Reading '" + relative + "' from cache")
                text = CompileCache.readCachedFile(shader, cache)
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