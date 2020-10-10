
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

    async perform(resources) {
        Timings.begin("Compiling stylesheets")

        let cache = await CompileCache.readCache("css-compiler")

        const files = async (extension, filter) => {
            let paths = resources.filter(a => a.resource.endsWith(extension))

            if(typeof filter !== "function") filter = null

            for(let entry of paths) {
                let path = entry.resource
                if(this.compiledResources.has(path)) continue

                let stat = undefined

                stat = await fs.promises.stat(path).catch(() => {})

                if(!stat || !stat.isFile()) {
                    console.error("Failed to access " + path + " (called from " + entry.caller + ")")
                    continue
                }

                let file = await fs.promises.readFile(path, 'utf8')
                let relative = path.substr(Compiler.projectDirectory.length)

                if(filter !== null) {
                    if(await CompileCache.shouldUpdate(path, cache)) {
                        Timings.begin("Compiling '" + relative + "'")
                        file = await filter(path, file)
                        CompileCache.updateFile(path, cache, file)
                    } else {
                        Timings.begin("Reading '" + relative + "' from cache")
                        file = CompileCache.readCachedFile(path, cache)
                    }
                } else {
                    Timings.begin("Inlining '" + relative + "'")
                }

                let value = JSBuilder.replace(base, {
                    path: relative,
                    content: file
                })

                this.compiledResources.set(path, value)

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

        await fs.promises.access(dirname).catch(async (error) => {
            await fs.promises.mkdir(dirname)
        })

        await fs.promises.writeFile(destination, this.getString(), 'utf8')
    }
}

module.exports = CSSPlugin