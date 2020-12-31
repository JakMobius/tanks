
import Base64 from '../../utils/base64';
import BinaryDecoder from '../../serialization/binary/binarydecoder';
import BinaryEncoder from '../../serialization/binary/binaryencoder';
import pako from 'pako';
import EditorMap from './editormap';

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
                let data = Base64.base64ToBytes(base64)

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

    static write(maps) {
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
        window.localStorage.setItem("editor-maps", Base64.bytesToBase64(new Uint8Array(buffer)))
    }

    static readMap(buffer) {
        let raw = pako.inflate(buffer)

        this.mapDecoder.reset()
        this.mapDecoder.readData(raw.buffer)

        let map = EditorMap.fromBinary(this.mapDecoder)
        map.size = buffer.length
        return map
    }

    /**
     *
     * @param map {GameMap}
     * @param flags {number[]?}
     * @returns {Uint8Array}
     */
    static writeMap(map, flags?) {
        this.mapEncoder.reset()
        map.toBinary(this.mapEncoder, flags)
        
        return pako.gzip(new Uint8Array(this.mapEncoder.compile()))
    }
}

export default MapStorage;