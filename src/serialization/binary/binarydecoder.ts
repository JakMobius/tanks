
import BinaryPool from './binarypool';
import {ByteArray, ByteArrayConstructor} from './buffer';
import {Constructor} from "./serializable";
import Buffer from "./buffer";

export interface BinaryDecoderConfig {
    largeIndices?: boolean
    readIndexMode?: boolean
}

class BinaryDecoder extends BinaryPool {
	public largeIndices: boolean;
	public readIndexMode: boolean;
	public buffers = new Map<ByteArrayConstructor<ByteArray>, Buffer<ByteArray>>();

    /**
     * Shared instance of `BinaryDecoder`
     */
    static shared: BinaryDecoder = new BinaryDecoder()

    constructor(options?: BinaryDecoderConfig) {
        super();
        options = options || {}

        this.largeIndices = !!options.largeIndices
        this.readIndexMode = !!options.readIndexMode

        this.setupBuffers()
    }

    /**
     * Reads binary data to buffers. Then
     * it's possible to use read functions
     * as `readString` or `readUint32`
     * @param array Data buffer to read.
     */
    readData(array: ArrayBuffer) {
        let compilerBytes = Uint16Array.BYTES_PER_ELEMENT
        let bufferIndex = 0
        let arrayPointer = 0
        let offset = compilerBytes * BinaryPool.bufferTypes.size

        if(this.readIndexMode) {
            this.largeIndices = !!(new Uint8Array(array, 0, 1)[0]);
            array = array.slice(1)
        }

        if(this.largeIndices) {
            offset *= 2
        }

        for(let buffer of this.buffers.values()) {
            let size

            if(this.largeIndices) {
                let words = new Uint16Array(array, compilerBytes * bufferIndex * 2, 2)
                size = words[0] + (words[1] << 16)
            } else {
                size = new Uint16Array(array, compilerBytes * bufferIndex, 1)[0]
            }

            if(size === 0) {
                bufferIndex++
                continue
            }

            let bytes = buffer.clazz.BYTES_PER_ELEMENT
            let alignment = Math.max(bytes, compilerBytes);

            arrayPointer = Math.ceil(arrayPointer / alignment) * alignment

            buffer.read(array, offset + arrayPointer, size)

            arrayPointer += size * bytes
            bufferIndex++
        }
    }

    private setupBuffers() {
        for(let [type, buffer] of BinaryPool.bufferTypes.entries()) {
            let newBuffer = buffer.clone()
            newBuffer.createBuffer()

            this.buffers.set(type, newBuffer)
        }
    }

    getTypedBuffer<T extends ByteArray>(type: ByteArrayConstructor<T>): Buffer<T> | null {
        return this.buffers.get(type) as Buffer<T>
    }

    /**
     * Reads and returns an signed 8-bit integer or `Int8Array` when `n > 1`.
     */
    readInt8(): number
    readInt8(n: number): Int8Array
    readInt8(n?: number): Int8Array | number {
        return this.getTypedBuffer(Int8Array).next(n)
    }

    /**
     * Reads and returns an unsigned 8-bit integer or `Uint8Array` when `n > 1`.
     */
    readUint8(): number
    readUint8(n: number): Uint8Array
    readUint8(n?: number): Uint8Array | number {
        return this.getTypedBuffer(Uint8Array).next(n)
    }

    /**
     * Reads and returns an signed 16-bit integer an `Int16Array` when `n > 1`.
     */
    readInt16(): number
    readInt16(n: number): Int16Array
    readInt16(n?: number): Int16Array | number {
        return this.getTypedBuffer(Int16Array).next(n)
    }

    /**
     * Reads and returns an unsigned 16-bit integer an `Uint16Array` when `n > 1`.
     */
    readUint16(): number
    readUint16(n: number): Uint16Array
    readUint16(n?: number): Uint16Array | number {
        return this.getTypedBuffer(Uint16Array).next(n)
    }

    /**
     * Reads and returns an signed 32-bit integer or `Int32Array` when `n > 1`.
     */
    readInt32(): number
    readInt32(n: number): Int32Array
    readInt32(n?: number): Int32Array | number {
        return this.getTypedBuffer(Int32Array).next(n)
    }

    /**
     * Reads and returns an unsigned 32-bit integer or `Uint32Array` when `n > 1`.
     */
    readUint32(): number
    readUint32(n: number): Uint32Array
    readUint32(n?: number): Uint32Array | number {
        return this.getTypedBuffer(Uint32Array).next(n)
    }

    /**
     * Reads and returns an single-precision float or `Float32Array` when `n > 1`.
     */
    readFloat32(): number
    readFloat32(n: number): Float32Array
    readFloat32(n?: number): Float32Array | number {
        return this.getTypedBuffer(Float32Array).next(n)
    }

    /**
     * Reads and returns an double-precision float or `Float64Array` when `n > 1`.
     */
    readFloat64(): number
    readFloat64(n: number): Float64Array
    readFloat64(n?: number): Float64Array | number {
        return this.getTypedBuffer(Float64Array).next(n)
    }

    /**
     * Reads and returns a string.
     */
    readString = () => {
        let buffer = this.getTypedBuffer(Uint16Array)

        let codes = [];
        let code;

        while((code = buffer.next()) !== 0) {
            codes.push(code)
        }

        return String.fromCharCode.apply(null, codes)
    }

    // Operating buffer pointers

    /**
     * Resets pointer of each buffer
     */
    reset() {
        for(let buffer of this.buffers.values()) {
            buffer.reset()
        }
    }

    /**
     * Saves pointer state of each buffer.
     * Return to the last saved state
     * by calling `restore` method
     */
    save() {
        for(let buffer of this.buffers.values()) {
            buffer.save()
        }
    }

    /**
     * Restores last saved pointer state
     * of each buffer. See also `save`
     */
    restore() {
        for(let buffer of this.buffers.values()) {
            buffer.save()
        }
    }
}

export default BinaryDecoder;