
const fs = require("fs")
const path = require("path")

try {
    fs.rmdirSync(path.resolve(__dirname, "../cache"), {
        recursive: true
    })
} catch(error) {

}

console.log("Build cache has been deleted")