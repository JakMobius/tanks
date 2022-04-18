import pako from 'pako';
import path from 'path';
import fs from 'fs';

function convert(data: ArrayBuffer) {
    return new Uint8Array(data)
}

const mapsPath = path.resolve(__dirname, '../../src/server/resources/maps')
const convertedPath = path.resolve(mapsPath, 'converted-maps')
if(!fs.existsSync(convertedPath)) {
    fs.mkdirSync(convertedPath)
}

let files = fs.readdirSync(mapsPath)

for(let file of files) {
    if(file.endsWith(".map")) {
        console.log("Converting " + file)
        let data = pako.inflate(fs.readFileSync(path.resolve(mapsPath, file))).buffer;
        fs.writeFileSync(path.resolve(convertedPath, file), pako.gzip(convert(data)))
    }
}