
const fs = require("fs").promises
const path = require("path")
const copyDirectory = require("./copy-directory.js")

module.exports = async function insertDirectory(from, to) {
    let list = await fs.readdir(from);

    for(let name of list) {
        const each_path = path.resolve(from, name)
        const stat = await fs.stat(each_path)

        if(stat.isDirectory()) {
            await copyDirectory(each_path, to)
        } else {
            await fs.copyFile(each_path, path.resolve(to, name))
        }
    }
}