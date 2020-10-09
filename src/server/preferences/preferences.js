
const JSON5 = require("json5")
const path = require("path")
const fs = require("fs").promises

const preferencesPath = path.resolve(__dirname, "../preferences.json")
const defaultsPath = path.resolve(__dirname, "default.json")

class Preferences {

    static root = null

    static async resetPreferences() {
        return fs.copyFile(defaultsPath, preferencesPath)
    }
    static async read() {

        await fs.access(preferencesPath).catch(async (err) => {
            if(err.code = "ENOENT") {
                await Preferences.resetPreferences()
            } else {
                throw err
            }
        }).then(async () => {
            const data = await fs.readFile(preferencesPath, "utf-8")

            Preferences.root = JSON5.parse(data)
        })
    }

    /**
     * Returns preferences value for key
     * @param {string} path
     * @return {any}
     */
    static value(path) {

        let directory = Preferences.root

        for(let item of path.split(".")) {

            if(typeof directory != "object" || !directory) {
                return undefined
            }

            directory = directory[item];
        }

        return directory
    }
}

module.exports = Preferences