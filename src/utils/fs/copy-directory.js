
const fs = require("fs").promises
const path = require("path")

module.exports = async function copyDirectory(from, to) {
    try {
        await fs.mkdir(to);
    } catch(e) {}

    for(let element of await fs.readdir(from)) {
        const stat = await fs.lstat(path.join(from, element));
        if (stat.isFile()) {
            await fs.copyFile(path.join(from, element), path.join(to, element));
        } else if (stat.isSymbolicLink()) {
            await fs.symlink(await fs.readlink(path.join(from, element)), path.join(to, element));
        } else if (stat.isDirectory()) {
            await copyDirectory(path.join(from, element), path.join(to, element));
        }
    }
}