const fs = require('fs');
const path = require('path');

module.exports = async function readdirDeep(directory, array, base) {

    if(!array) array = []
    if(!base) base = ""

    if (fs.statSync(directory).isDirectory()) {
        await fs.readdirSync(directory).map(async file => {
            let item = path.join(directory, file)
            let subbase = path.join(base, file)
            array.push(subbase)

            await readdirDeep(item, array, subbase)
        })
    }
    return array
};