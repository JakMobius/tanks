
const Logger = require("../log/logger")
const fs = require("fs")

class LibraryLoader {

    static path = (function () {
        let path = __dirname.split("/")
        path.splice(path.length - 1, 1);
        return path.join("/") + "/"
    })()

    static load(library, callback) {
        library = LibraryLoader.path + library
        if(!library.endsWith("/")) {
            library += "/"
        }

        while(!library.startsWith("//")) library = "/" + library

        fs.readdirSync(library).forEach(function (file) {
            let stat = fs.statSync(library + file)
            if(stat.isDirectory()) {
                if(!fs.existsSync(library + file + "/index.js")) {
                    return
                }
            } else if(!file.endsWith(".js")) return
            try {
                if(callback) callback(file, require(library + file));
                else require(library + file)

            } catch (error) {
                Logger.global.log("Failed to load " + file)
                Logger.global.log(error)
            }
        })
    }
}

module.exports = LibraryLoader