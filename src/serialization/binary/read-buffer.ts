
export default class ReadBuffer {
    buffer: ArrayBuffer
    view: DataView
    offset: number = 0

    private static shared = new ReadBuffer(null)

    static getShared(buffer: ArrayBuffer) {
        this.shared.offset = 0
        this.shared.setBuffer(buffer)
        return this.shared
    }

    constructor(buffer: ArrayBuffer) {
        this.setBuffer(buffer)
        this.offset = 0;
    }

    setBuffer(buffer: ArrayBuffer) {
        this.buffer = buffer
        if(buffer) {
            this.view = new DataView(buffer)
        }
    }

    readBytes(length: number) {
        let slice = new Uint8Array(this.buffer.slice(this.offset, this.offset + length));
        this.offset += length
        return slice
    }

    readFloat64() {
        let result = this.view.getFloat64(this.offset)
        this.offset += 8
        return result
    }

    readFloat32() {
        let result = this.view.getFloat32(this.offset)
        this.offset += 4
        return result
    }

    readUint32() {
        let result = this.view.getUint32(this.offset)
        this.offset += 4
        return result
    }

    readInt32() {
        let result = this.view.getInt32(this.offset)
        this.offset += 4
        return result
    }

    readUint16() {
        let result = this.view.getUint16(this.offset)
        this.offset += 2
        return result
    }

    readInt16() {
        let result = this.view.getInt16(this.offset)
        this.offset += 2
        return result
    }

    readUint8() {
        let result = this.view.getUint8(this.offset)
        this.offset += 1
        return result
    }

    readInt8() {
        let result = this.view.getInt8(this.offset)
        this.offset += 1
        return result
    }

    readString() {
        let length = this.readUint32()
        let result = ""
        for(let i = 0; i < length; i++) {
            result += String.fromCharCode(this.readUint16())
        }
        return result
    }
}