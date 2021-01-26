
import BinaryEncoder from '../../serialization/binary/binaryencoder';
import GameMap from './gamemap';
import pako from 'pako';
import path from 'path';
import BinaryDecoder from '../../serialization/binary/binarydecoder';
import EditorMap from '../../client/map-editor/editormap';
import BlockState from './blockstate/blockstate';
import SpawnZone from './spawnzone';
import fs from 'fs';

class MapConverter {
    static jsonToBinary(json: any) {
        let spawnZones = json["spawnZones"]
        let data = json["data"]

        let encoder = new BinaryEncoder()
        encoder.reset()

        let count = 0
        if(spawnZones) count++
        if(data) count++

        encoder.writeUint16(count)

        if(spawnZones) this.writeBinarySpawnZones(spawnZones, encoder)
        if(data) this.writeBinaryMapData(data, encoder)

        let buffer = encoder.compile()

        return pako.gzip(new Uint8Array(buffer));
    }

    static writeBinarySpawnZones(json: any, encoder: BinaryEncoder) {
        encoder.writeUint16(GameMap.BinaryOptions.SPAWN_ZONES_FLAG)

        encoder.writeUint16(json.length)
        for(let zone of json) {
            for(let coordinate of zone) {
                encoder.writeInt32(coordinate[0])
                encoder.writeInt32(coordinate[1])
            }
        }
    }

    static writeBinaryMapData(string: string, encoder: BinaryEncoder) {
        encoder.writeUint16(GameMap.BinaryOptions.DATA_FLAG)

        let array = new Uint32Array(string.split(",").map(a => parseInt(a, 36)))
        encoder.writeUint16(array.length)
        encoder.writeUint32Array(array)
    }

    // static version(data) {
    //     let decoder = BinaryDecoder.shared
    //     decoder.reset()
    //     decoder.readData(data)
    //
    //     let flagCount = decoder.readUint16()
    //     if(flagCount === 0) {
    //         return 0x0000
    //     }
    //     let flag = decoder.readUint16()
    //     if(flag === GameMap.BinaryOptions.VERSION_FLAG) {
    //         return decoder.readUint16()
    //     }
    //
    //     return 0x0000
    // }

    static convert_0x0000_to_0x0001(data: ArrayBuffer) {
        let decoder = BinaryDecoder.shared
        decoder.reset()
        decoder.readData(data)

        let encoder = new BinaryEncoder({
            largeIndices: true
        })
        encoder.reset()

        let count = decoder.readUint16()
        let width = 50
        let height = 50

        encoder.writeUint16(count)

        for(let i = 0; i < count; i++) {
            let flag = decoder.readUint16()
            encoder.writeUint16(flag)

            if(flag === GameMap.BinaryOptions.DATA_FLAG) {
                let count = width * height

                for(let i = 0; i < count; i++) {
                    let oldBlock = decoder.readUint32()
                    let id = (oldBlock & 2130706432) >> 24
                    let Block = BlockState.getBlockStateClass(id)
                    encoder.writeUint8(id)
                    Block.BinaryOptions.convertOptions(encoder, {})
                }
            } else if(flag === GameMap.BinaryOptions.SPAWN_ZONES_FLAG) {
                let zones = decoder.readUint16()
                encoder.writeUint16(zones)

                while(zones--) {
                    let zone = new SpawnZone(zones)
                    zone.setFrom(decoder.readInt32(), decoder.readInt32())
                    zone.setTo(decoder.readInt32(), decoder.readInt32())

                    zone.toBinary(encoder)
                }
            } else if(flag === GameMap.BinaryOptions.SIZE_FLAG) {
                width = decoder.readUint32()
                height = decoder.readUint32()
                encoder.writeUint32(width)
                encoder.writeUint32(height)
            } else if(flag === EditorMap.BinaryOptions.NAME_FLAG) {
                encoder.writeString(decoder.readString())
            }
        }

        return encoder.compile()
    }
}

const mapsPath = path.resolve(__dirname, 'resources/maps')
let files = fs.readdirSync(mapsPath)

for(let file of files) {
    if(file.endsWith(".json")) {
        const json = JSON.parse(fs.readFileSync(path.resolve(mapsPath, file), 'utf8'))

        let array = MapConverter.jsonToBinary(json)

        fs.writeFileSync(path.resolve(mapsPath, "converted", file.slice(0, -5) + '.map'), new Uint8Array(array))
    }
}

files = fs.readdirSync(path.resolve(mapsPath, "converted"))

for(let file of files) {
    if(file.endsWith(".map")) {

        let data = pako.inflate(fs.readFileSync(path.resolve(mapsPath, "converted", file))).buffer;
        //let version = MapConverter.version(data)

        //if(version < lastVersion) {
        let buffer = MapConverter.convert_0x0000_to_0x0001(data)
        fs.writeFileSync(path.resolve(mapsPath, "new", file.slice(0, -4) + '.map'), pako.gzip(new Uint8Array(buffer)))
        //}
    }
}
