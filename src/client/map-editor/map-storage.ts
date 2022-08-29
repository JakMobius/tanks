import {base64ToBytes, bytesToBase64} from '../../utils/base64';
import pako from 'pako';
import ReadBuffer from "../../serialization/binary/read-buffer";
import WriteBuffer from "../../serialization/binary/write-buffer";
import MapSerialization from "../../map/map-serialization";
import GameMap from "../../map/game-map";

export default class MapStorage {

    static read() {
        let base64 = window.localStorage.getItem("editor-maps")

        if (base64) {
            let result = []
            try {
                let data = base64ToBytes(base64)

                let decoder = ReadBuffer.getShared(data.buffer);

                let maps = decoder.readInt16()

                while (maps--) {
                    let length = decoder.readInt32()
                    let bytes = decoder.readBytes(length)

                    result.push(this.readMap(bytes))
                }
            } catch (ignored) {
                console.log(ignored)
                return []
            }
            return result
        }
        return []
    }

    static write(maps: GameMap[]) {
        WriteBuffer.shared.reset()

        WriteBuffer.shared.writeInt16(maps.length)
        let length = maps.length

        for(let i = 0; i < length; i++) {
            let bytes = this.writeMap(maps[i])

            WriteBuffer.shared.writeInt16(bytes.length)
            WriteBuffer.shared.writeBytes(bytes)
        }

        let buffer = WriteBuffer.shared.spitBuffer()
        window.localStorage.setItem("editor-maps", bytesToBase64(buffer))
    }

    static readMap(buffer: Uint8Array) {
        let raw = pako.inflate(buffer)

        return MapSerialization.fromBuffer(raw)
    }

    static writeMap(map: GameMap): Uint8Array {
        WriteBuffer.shared.reset()
        map.toBinary(WriteBuffer.shared)
        return pako.gzip(WriteBuffer.shared.spitBuffer())
    }
}