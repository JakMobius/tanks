
import {base64ToBytes, bytesToBase64} from '../../utils/base64';
import BinaryDecoder from '../../serialization/binary/binary-decoder';
import BinaryEncoder from '../../serialization/binary/binary-encoder';
import pako from 'pako';
import EditorMap from './editor-map';

class MapStorage {
	public dataDecoder: any;
	public dataEncoder: any;
	public mapDecoder: any;
	public mapEncoder: any;
    static dataDecoder = new BinaryDecoder({ largeIndices: true })
    static mapDecoder = new BinaryDecoder({ largeIndices: true })

    static dataEncoder = new BinaryEncoder({ largeIndices: true })
    static mapEncoder = new BinaryEncoder({ largeIndices: true })

    static read() {
        let base64 = window.localStorage.getItem("editor-maps")

        if (base64) {
            let result = []
            try {
                let data = base64ToBytes(base64)

                this.dataDecoder.reset()
                this.dataDecoder.readData(data.buffer)

                let maps = this.dataDecoder.readUint16()

                while (maps--) {
                    let length = this.dataDecoder.readUint32()
                    let bytes = this.dataDecoder.readUint8(length)

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

    static write(maps: EditorMap[]) {
        this.dataEncoder.reset()

        this.dataEncoder.writeUint16(maps.length)
        let length = maps.length

        for(let i = 0; i < length; i++) {
            let bytes = this.writeMap(maps[i])
            maps[i].size = bytes.length

            this.dataEncoder.writeUint32(bytes.length)
            this.dataEncoder.writeUint8Array(bytes)
        }

        let buffer = this.dataEncoder.compile()
        window.localStorage.setItem("editor-maps", bytesToBase64(new Uint8Array(buffer)))
    }

    static readMap(buffer: Uint8Array) {
        let raw = pako.inflate(buffer)

        this.mapDecoder.reset()
        this.mapDecoder.readData(raw.buffer)

        let map = EditorMap.fromBinary(this.mapDecoder)
        map.size = buffer.length
        return map
    }

    static writeMap(map: EditorMap, flags?: number[]): Uint8Array {
        this.mapEncoder.reset()
        map.toBinary(this.mapEncoder, flags)
        
        return pako.gzip(new Uint8Array(this.mapEncoder.compile()))
    }
}

export default MapStorage;