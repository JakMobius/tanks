
export default class WriteBuffer {
    buffer: Uint8Array
    view: DataView
    size: number = 0
    offset: number = 0

    static shared = new WriteBuffer()

    constructor() {
        this.buffer = new Uint8Array(512);
        this.view = new DataView(this.buffer.buffer)
        this.size = 512;
    }

    private extend() {
        let newBuffer = new Uint8Array(this.size * 2);
        newBuffer.set(this.buffer)
        this.view = new DataView(newBuffer.buffer)
        this.buffer = newBuffer
        this.size *= 2
    }

    private prepareSpace(size: number) {
        this.offset += size
        if(this.offset > this.size) {
            this.extend()
        }
    }

    writeBytes(data: Uint8Array) {
        let pos = this.offset
        this.prepareSpace(data.byteLength)
        this.buffer.set(data, pos)
    }

    writeFloat64(num: number) {
        let pos = this.offset
        this.prepareSpace(8)
        this.view.setFloat64(pos, num)
    }

    writeFloat32(num: number) {
        let pos = this.offset
        this.prepareSpace(4)
        this.view.setFloat32(pos, num)
    }

    writeUint32(num: number) {
        let pos = this.offset
        this.prepareSpace(4)
        this.view.setUint32(pos, num)
    }

    writeInt32(num: number) {
        let pos = this.offset
        this.prepareSpace(4)
        this.view.setInt32(pos, num)
    }

    writeUint16(num: number) {
        let pos = this.offset
        this.prepareSpace(2)
        this.view.setUint16(pos, num)
    }

    writeInt16(num: number) {
        let pos = this.offset
        this.prepareSpace(2)
        this.view.setInt16(pos, num)
    }

    writeUint8(num: number) {
        let pos = this.offset
        this.prepareSpace(1)
        this.view.setUint8(pos, num)
    }

    writeInt8(num: number) {
        let pos = this.offset
        this.prepareSpace(1)
        this.view.setInt8(pos, num)
    }

    writeString(str: string) {
        this.writeUint32(str.length)
        for(let i = 0; i < str.length; i++) {
            this.writeUint16(str.charCodeAt(i))
        }
    }

    getBuffer() {
        return this.buffer.slice(0, this.offset)
    }

    spitBuffer() {
        let buffer = this.getBuffer()
        this.reset()
        return buffer
    }

    reset() {
        this.offset = 0
    }
}