
const fs = require("fs").promises
const path = require("path")
const cacheFile = path.resolve(__dirname, "cache/cache.json")

class CompileCache {

    /**
     * @private
     */
    static async createCacheFile(cacheFile) {
        await this.createCache()
        await fs.writeFile(cacheFile, "{}")
    }

    static async readCache(section) {
        let cache = null

        try {
            cache = await fs.readFile(cacheFile)
        } catch(e) {
            await this.createCacheFile(cacheFile)
        }

        if(!cache) {
            let object = {}
            object[section] = {}
            return object
        }

        let file
        await fs.readFile(cacheFile, 'utf8').then(f => file = f).catch(e => file = null)

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

        try {
            await fs.access(file)
        } catch(error) {
            return true
        }

        let stats = await fs.stat(file)

        return cacheEntry.modificationTime < stats.mtime
    }

    static async createCache(file) {
        let dirname = path.dirname(cacheFile)

        await fs.access(dirname).catch(error => {
            return fs.mkdir(dirname, { recursive: true })
        })
    }

    static updateFile(file, section, data) {
        if (section[file]) {
            section[file].modificationTime = Date.now()
            section[file].data = data
        } else {
            section[file] = {
                modificationTime: Date.now(),
                data: data
            }
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
        await fs.writeFile(cacheFile, JSON.stringify(cache, null, "\t")).catch(e => {
            console.warn(e)
        })
    }

    static async clear() {
        try {
            await fs.unlink(cacheFile)
        } catch(e) {}
    }
}

module.exports = CompileCache