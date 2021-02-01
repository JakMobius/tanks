const path = require("path")
const CompilerCache = require("./compilecache")
const Compiler = () => require("./compiler/compiler")
const prefix = "/* @load-resource: "
const suffix = "*/"

function findResources(string, file) {
    return string.split("\n")
        .map(a => a.trim())
        .filter(a => a.startsWith(prefix) && a.endsWith(suffix))
        .map(a => {
            return a.substr(prefix.length, a.length - prefix.length - suffix.length).trim().replace(/["']/g, "")
        })
        .map(a => {
            if (a.startsWith("/"))
                return path.resolve(Compiler().projectDirectory, a.substr(1))
            return path.resolve(file, "..", a)
        }).map(a => { return {
            "caller": file,
            "resource": a
        }})
}

module.exports = function() {

    let result = {
        resources: [],
        entries: [],
        plugin: null
    }

    result.readResources = async function(compiler) {
        let cache = await CompilerCache.readCache("resourceify")

        // Iterating in reverse order because depencencies are added
        // with post-order, which ends up in reverse order of
        // included resources

        for(let i = result.entries.length - 1; i >= 0; i--) {
            let entry = result.entries[i]
            compiler.addProjectFile(entry.file)
            let name = entry.file

            let resources

            if (await CompilerCache.shouldUpdate(name, cache)) {
                resources = findResources(entry.source, entry.file)
                CompilerCache.updateFile(name, cache, resources)
            } else {
                resources = CompilerCache.readCachedFile(name, cache)
            }

            if (resources.length)
                result.resources = result.resources.concat(resources)
        }

        await CompilerCache.writeCache("resourceify", cache)

        for(let resource of result.resources) {
            compiler.addProjectFile(resource.resource)
        }

        return result.resources
    }

    result.plugin = function (b, opts) {

        let depsStream = b.pipeline._streams.filter(stream => stream.label === "json")[0]
        depsStream.on('data', async function(entry) {
            result.entries.push(entry)
        })
    }

    return result
}