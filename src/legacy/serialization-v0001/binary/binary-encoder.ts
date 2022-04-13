
import Buffer, {ByteArray, ByteArrayConstructor} from './buffer';
import BinaryPool from './binary-pool';

export interface BinaryEncoderConfig {
    largeIndices?: boolean
    writeIndexMode?: boolean
}

class BinaryEncoder extends BinaryPool {
	public buffers: Map<ByteArrayConstructor<ByteArray>, Buffer<ByteArray>>
	public largeIndices: boolean;
	public writeIndexMode: boolean
    static shared = new BinaryEncoder()

    compileBuffer = new Buffer({
        clazz: Uint16Array,
        capacity: 512
    })

    constructor(options?: BinaryEncoderConfig) {
        super()
        options = options || {}
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
    writeInt8(int8: number) { this.buffers.get(Int8Array).push(int8) }

    /**
     * Writes unsigned byte to buffer
     * @param uint8 {number} value to write
     */
    writeUint8(uint8: number) { this.buffers.get(Uint8Array).push(uint8) }

    /**
     * Writes signed 2-byte integer to buffer
     * @param int16 {number} value to write
     */
    writeInt16(int16: number) { this.buffers.get(Int16Array).push(int16) }

    /**
     * Writes unsigned 2-byte integer to buffer
     * @param uint16 {number} value to write
     */
    writeUint16(uint16: number) { this.buffers.get(Uint16Array).push(uint16) }

    /**
     * Writes signed 4-byte integer to buffer
     * @param int32 {number} value to write
     */
    writeInt32(int32: number) { this.buffers.get(Int32Array).push(int32) }

    /**
     * Writes unsigned 4-byte integer to buffer
     * @param uint32 {number} value to write
     */
    writeUint32(uint32: number) { this.buffers.get(Uint32Array).push(uint32) }

    /**
     * Writes medium-precision float to buffer
     * @param float32 {number} value to write
     */
    writeFloat32(float32: number) { this.buffers.get(Float32Array).push(float32) }

    /**
     * Writes high-precision float to buffer
     * @param float64 {number} value to write
     */
    writeFloat64(float64: number) { this.buffers.get(Float64Array).push(float64) }

    /**
     * Writes a null-terminated string to buffer
     * @param string {string} value to write
     */
    writeString(string: string) {
        let buffer = this.buffers.get(Uint16Array)

        for(let i = 0, l = string.length; i < l; i++) {
            let code = string.charCodeAt(i)
            buffer.push(code)
        }

        buffer.push(0) // Adding string end character '\0'
    }

    writeInt8Array    (int8Array:    Int8Array)    { this.buffers.get(Int8Array)   .appendArray(int8Array) }
    writeUint8Array   (uint8Array:   Uint8Array)   { this.buffers.get(Uint8Array)  .appendArray(uint8Array) }
    writeInt16Array   (int16Array:   Int16Array)   { this.buffers.get(Int16Array)  .appendArray(int16Array) }
    writeUint16Array  (uint16Array:  Uint16Array)  { this.buffers.get(Uint16Array) .appendArray(uint16Array) }
    writeInt32Array   (int32Array:   Int32Array)   { this.buffers.get(Int32Array)  .appendArray(int32Array) }
    writeUint32Array  (uint32Array:  Uint32Array)  { this.buffers.get(Uint32Array) .appendArray(uint32Array) }
    writeFloat32Array (float32Array: Float32Array) { this.buffers.get(Float32Array).appendArray(float32Array) }
    writeFloat64Array (float64Array: Float64Array) { this.buffers.get(Float64Array).appendArray(float64Array) }

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

export default BinaryEncoder;