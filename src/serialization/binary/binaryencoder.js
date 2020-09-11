
const Buffer = require('./buffer')
const BinaryPool = require('./binarypool')

class BinaryEncoder extends BinaryPool {

    static shared = new BinaryEncoder()

    compileBuffer = new Buffer({
        clazz: Uint16Array,
        capacity: 512
    })

    constructor(options) {
        options = options || {}
        super();
        this.buffers = new Map()
        this.largeIndices = !!options.largeIndices
        this.writeIndexMode = !!options.writeIndexMode

        this.setupBuffers()
    }

    setupBuffers() {
        for(let [type, buffer] of BinaryEncoder.bufferTypes.entries()) {
            let newBuffer = buffer.clone()
            newBuffer.createBuffer()

            this.buffers.set(type, newBuffer)
        }
        this.compileBuffer.createBuffer()
    }

    reset() {
        for(let buffer of this.buffers.values()) {
            buffer.reset()
        }
    }

    /**
     * Writes signed byte to buffer
     * @param int8 {number} value to write
     */
    writeInt8    = int8    => { this.buffers.get(BinaryEncoder.INT8).push(int8) }

    /**
     * Writes unsigned byte to buffer
     * @param uint8 {number} value to write
     */
    writeUint8   = uint8   => { this.buffers.get(BinaryEncoder.UINT8).push(uint8) }

    /**
     * Writes signed 2-byte integer to buffer
     * @param int16 {number} value to write
     */
    writeInt16   = int16   => { this.buffers.get(BinaryEncoder.INT16).push(int16) }

    /**
     * Writes unsigned 2-byte integer to buffer
     * @param uint16 {number} value to write
     */
    writeUint16  = uint16  => { this.buffers.get(BinaryEncoder.UINT16).push(uint16) }

    /**
     * Writes signed 4-byte integer to buffer
     * @param int32 {number} value to write
     */
    writeInt32   = int32   => { this.buffers.get(BinaryEncoder.INT32).push(int32) }

    /**
     * Writes unsigned 4-byte integer to buffer
     * @param uint32 {number} value to write
     */
    writeUint32  = uint32  => { this.buffers.get(BinaryEncoder.UINT32).push(uint32) }

    /**
     * Writes medium-precision float to buffer
     * @param float32 {number} value to write
     */
    writeFloat32 = float32 => { this.buffers.get(BinaryEncoder.FLOAT32).push(float32) }

    /**
     * Writes high-precision float to buffer
     * @param float64 {number} value to write
     */
    writeFloat64 = float64 => { this.buffers.get(BinaryEncoder.FLOAT64).push(float64) }

    /**
     * Writes a null-terminated string to buffer
     * @param string {string} value to write
     */
    writeString  = string  => {
        let buffer = this.buffers.get(BinaryEncoder.UINT16)

        for(let i = 0, l = string.length; i < l; i++) {
            let code = string.charCodeAt(i)
            buffer.push(code)
        }

        buffer.push(0) // Adding string end character '\0'
    }

    writeInt8Array    = int8Array    => this.buffers.get(BinaryEncoder.INT8).appendArray(int8Array)
    writeUint8Array   = uint8Array   => this.buffers.get(BinaryEncoder.UINT8).appendArray(uint8Array)
    writeInt16Array   = int16Array   => this.buffers.get(BinaryEncoder.INT16).appendArray(int16Array)
    writeUint16Array  = uint16Array  => this.buffers.get(BinaryEncoder.UINT16).appendArray(uint16Array)
    writeInt32Array   = int32Array   => this.buffers.get(BinaryEncoder.INT32).appendArray(int32Array)
    writeUint32Array  = uint32Array  => this.buffers.get(BinaryEncoder.UINT32).appendArray(uint32Array)
    writeFloat32Array = float32Array => this.buffers.get(BinaryEncoder.FLOAT32).appendArray(float32Array)
    writeFloat64Array = float64Array => this.buffers.get(BinaryEncoder.FLOAT64).appendArray(float64Array)

    compile() {
        this.compileBuffer.reset()

        if(this.largeIndices) {
            for(let buffer of this.buffers.values()) {
                this.compileBuffer.push(buffer.pointer & 0xFFFF)
                this.compileBuffer.push((buffer.pointer >> 16) & 0xFFFF)
            }
        } else {
            for(let buffer of this.buffers.values()) {
                this.compileBuffer.push(buffer.pointer)
            }
        }

        for(let buffer of this.buffers.values()) {
            this.compileBuffer.appendBuffer(buffer)
        }

        if(this.writeIndexMode) {
            let result = new Uint8Array(this.compileBuffer.pointer * 2 + 1)
            result[0] = Number(this.largeIndices)
            result.set(new Uint8Array(this.compileBuffer.toArrayBuffer()), 1)
            return result.buffer
        } else {
            return this.compileBuffer.toArrayBuffer()
        }
    }
}

module.exports = BinaryEncoder