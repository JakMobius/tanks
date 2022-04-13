import GameMap from '../map/game-map';
import pako from 'pako';
import path from 'path';
import EditorMap from '../client/map-editor/editor-map';
import BinaryDecoder0001 from "../legacy/serialization-v0001/binary/binary-decoder";
import fs from 'fs';
import WriteBuffer from "../serialization/binary/write-buffer";

class MapConverter {

    // It's bad.
    static convert_0x0001_to_0x0002(data: ArrayBuffer) {

        let writer = new WriteBuffer()
        let decoder = new BinaryDecoder0001({
            largeIndices: true
        })
        decoder.reset()
        decoder.readData(data)

        let count = decoder.readUint16()
        let width = 50
        let height = 50

        let stack: number[] = []

        writer.writeBytes(Buffer.from("TNKS"))  // Signature
        writer.writeUint32(1)                   // Version

        function startBlock() {
            stack.push(writer.offset)
            writer.writeUint32(-1)
        }

        function endBlock() {
            let top = stack[stack.length - 1]
            let end = writer.offset
            writer.offset = top
            writer.writeUint32(end - top)
            writer.offset = end
            stack.pop()
        }

        startBlock()

        for(let i = 0; i < count; i++) {
            startBlock()
            let flag = decoder.readUint16()
            writer.writeUint16(flag)

            if(flag === GameMap.BinaryOptions.DATA_FLAG) {
                let count = width * height

                for(let i = 0; i < count; i++) {
                    startBlock()
                    let id = decoder.readUint8()
                    writer.writeUint8(id)
                    endBlock()

                    if(id != 0) {
                        let flags = decoder.readUint8()
                        if (flags == 1) {
                            if(decoder.readUint8() != 0) {
                                throw "unexpected flag"
                            }
                            console.log("damage: " + decoder.readUint16() + ", i = " + i)
                        } else if (flags != 0) {
                            throw "unexpected flag count: " + flags
                        }
                    }
                }
            } else if(flag === GameMap.BinaryOptions.SPAWN_ZONES_FLAG) {
                let zones = decoder.readUint16()
                writer.writeUint16(zones)

                while(zones--) {
                    writer.writeInt8(decoder.readUint8())
                    writer.writeInt32(decoder.readUint32())
                    writer.writeInt32(decoder.readUint32())
                    writer.writeInt32(decoder.readUint32())
                    writer.writeInt32(decoder.readUint32())
                }
            } else if(flag === GameMap.BinaryOptions.SIZE_FLAG) {
                width = decoder.readUint32()
                height = decoder.readUint32()

                writer.writeUint32(width)
                writer.writeUint32(height)

            } else if(flag === EditorMap.BinaryOptions.NAME_FLAG) {
                let name = decoder.readString()
                writer.writeString(name)
            }

            endBlock()
        }

        endBlock()

        return writer.getBuffer()
    }
}

const mapsPath = path.resolve(__dirname, '../server/resources/maps')
const convertedPath = path.resolve(__dirname, '../converted-maps/')
if(!fs.existsSync(convertedPath)) {
    fs.mkdirSync(convertedPath)
}

let files = fs.readdirSync(mapsPath)

for(let file of files) {
    if(file.endsWith(".map")) {

        console.log("Converting " + file)
        let data = pako.inflate(fs.readFileSync(path.resolve(mapsPath, file))).buffer;

        let buffer = MapConverter.convert_0x0001_to_0x0002(data)
        fs.writeFileSync(path.resolve(convertedPath, file), pako.gzip(buffer))
    }
}