
const fs = require("fs").promises
const path = require("path")
const cacheFile = path.resolve(__dirname, "cache/cache.json")

class CompileCache {
    static async readCache(section) {
        let cache = null

        await fs.readFile(cacheFile).then(a => cache = a).catch(async e => {
            await fs.writeFile(cacheFile, "{}")
            let object = {}
            object[section] = {}
            return object
        })

        let file
        await fs.readFile(cacheFile, 'utf8').then(f => file = f).catch(e => f = null)

        if(file) {
            try {
                return JSON.parse(file)[section] || {}
            } catch(ex) {
                return {}
            }
        }

        return {}
    }

    static async shouldUpdate(file, section) {
        let cacheEntry = section[file]
        if(!cacheEntry) {
            return true
        }

        let stats = await fs.stat(file)

        return cacheEntry.modificationTime < stats.mtime
    }

    static updateFile(file, section, data) {
        if(!section[file]) {
            section[file] = {
                modificationTime: Date.now(),
                data: data
            }
        } else {
            section[file].modificationTime = Date.now()
            section[file].data = data
        }
    }

    static readCachedFile(file, section) {
        return section[file].data
    }

    static async writeCache(section, object) {
        let cache
        await fs.readFile(cacheFile, 'utf8').then(a => cache = a).catch(e => cache = {})
        try {
            cache = JSON.parse(cache)
        } catch(e) {
            cache = {}
        }
        cache[section] = object
        await fs.writeFile(cacheFile, JSON.stringify(cache, null, "\t"))
    }

    static async clear() {
        try {
            await fs.unlink(cacheFile)
        } catch(e) {}
    }
}

module.exports = CompileCache