
const Plugin = require("../../plugin")
const SASS = require("node-sass")
const CompileCache = require("../../../compilecache")
const JSBuilder = require("../../../jsbuilder")
const Timings = require("../../../timings")
const Compiler = require("../../compiler")

const fs = require('fs')
const path = require("path")

const base = fs.readFileSync(path.resolve(__dirname, "./base.js"), 'utf8')

class CSSPlugin extends Plugin {
    constructor(options) {
        super(options);

        this.destination = this.options.destination
        this.compiledResources = new Map()
    }

    async checkFilePath(entry) {
        try {
            if(!(await fs.promises.stat(entry.resource)).isFile()) {
                console.error("CSSPlugin failed to load shader because specified path is not a file");
                console.error(this.formatEntryForError(entry));
                return false
            }
        } catch(e) {
            console.error("CSSPlugin ecountered " + e.code + " while accessing the file");
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
        Timings.begin("Compiling stylesheets")

        let cache = await CompileCache.readCache("css-compiler")

        const files = async (extension, filter) => {
            let paths = resources.filter(a => a.resource.endsWith(extension))

            if(typeof filter !== "function") filter = null

            for(let entry of paths) {
                let resourcePath = entry.resource
                if(this.compiledResources.has(resourcePath)) continue
                if(!await this.checkFilePath(entry)) continue;

                let file = await fs.promises.readFile(resourcePath, 'utf8')
                let relative = resourcePath.substr(Compiler.projectDirectory.length)

                if(filter !== null) {
                    if(await CompileCache.shouldUpdate(resourcePath, cache)) {
                        Timings.begin("Compiling '" + relative + "'")
                        file = await filter(resourcePath, file)
                        CompileCache.updateFile(resourcePath, cache, file)
                    } else {
                        Timings.begin("Reading '" + relative + "' from cache")
                        file = CompileCache.readCachedFile(resourcePath, cache)
                    }
                } else {
                    Timings.begin("Inlining '" + relative + "'")
                }

                let value = JSBuilder.replace(base, {
                    path: relative,
                    content: file
                })

                this.compiledResources.set(resourcePath, value)

                Timings.end()
            }
        }

        await files(".css")
        await files(".scss", async (path, file) => {
            return await new Promise((resolve, reject) => {
                SASS.render({
                    data: file,
                    outputStyle: "expanded"
                }, (err, result) => {
                    if (err) reject(err)
                    else resolve(result.css.toString())
                })
            })
        })

        if(this.destination) {
            this.write(this.destination)
        }

        await CompileCache.writeCache("css-compiler", cache)

        Timings.end()
    }

    getString() {
        return Array.from(this.compiledResources.values()).join("\n")
    }

    async write(destination) {
        let dirname = path.dirname(destination)

        try {
            let stat = await fs.promises.stat(dirname);
            if(!stat.isDirectory()) {
                console.error("Invalid target path: " + path.relative(Compiler.projectDirectory, destination))
                return
            }

            await fs.promises.writeFile(destination, this.getString(), 'utf8')
            return
        } catch(e) {}

        try {
            await fs.promises.mkdir(dirname)
        } catch(e) {
            console.error(e)
            return
        }

        await fs.promises.writeFile(destination, this.getString(), 'utf8')
    }
}

module.exports = CSSPlugin