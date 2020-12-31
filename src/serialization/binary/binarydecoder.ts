
import BinaryPool from './binarypool';
import BinaryBuffer from './buffer';

class BinaryDecoder extends BinaryPool {
	public largeIndices: any;
	public readIndexMode: any;
	public buffers: any;
    /**
     * Shared instance of `BinaryDecoder`
     * @type {BinaryDecoder}
     */
    static shared = new BinaryDecoder()

    constructor(options?) {
        options = options || {}
        super();

        this.largeIndices = options.largeIndices
        this.readIndexMode = options.readIndexMode

        /** @type {Map<Number, BinaryBuffer>} */
        this.buffers = new Map()
        this.setupBuffers()
    }

    /**
     * Reads binary data to buffers. Then
     * it's possible to use read functions
     * as `readString` or `readUint32`
     * @param array {ArrayBuffer} Data buffer to read.
     */
    readData(array) {
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

    /**
     * Private function. Should never be used outside.
     */

    setupBuffers() {
        for(let [type, buffer] of BinaryPool.bufferTypes.entries()) {
            let newBuffer = buffer.clone()
            newBuffer.createBuffer()

            this.buffers.set(type, newBuffer)
        }
    }

    // Reading functions

    /**
     * Reads and returns an signed 8-bit integer or `Int8Array` when `n > 1`.
     * @param n{Number?} Number of entries to read.
     */
    readInt8    = (n?: Number) => this.buffers.get(BinaryPool.INT8).next(n)

    /**
     * Reads and returns an unsigned 8-bit integer or `Uint8Array` when `n > 1`.
     * @param n{Number?} Number of entries to read.
     */
    readUint8   = (n?: Number) => this.buffers.get(BinaryPool.UINT8).next(n)

    /**
     * Reads and returns an signed 16-bit integer an `Int16Array` when `n > 1`.
     * @param n{Number?} Number of entries to read.
     */
    readInt16   = (n?: Number) => this.buffers.get(BinaryPool.INT16).next(n)

    /**
     * Reads and returns an unsigned 16-bit integer an `Uint16Array` when `n > 1`.
     * @param n{Number?} Number of entries to read.
     */
    readUint16  = (n?: Number) => this.buffers.get(BinaryPool.UINT16).next(n)

    /**
     * Reads and returns an signed 32-bit integer or `Int32Array` when `n > 1`.
     * @param n{Number?} Number of entries to read.
     */
    readInt32   = (n?: Number) => this.buffers.get(BinaryPool.INT32).next(n)

    /**
     * Reads and returns an unsigned 32-bit integer or `Uint32Array` when `n > 1`.
     * @param n{Number?} Number of entries to read.
     */
    readUint32  = (n?: Number) => this.buffers.get(BinaryPool.UINT32).next(n)

    /**
     * Reads and returns an single-precision float or `Float32Array` when `n > 1`.
     * @param n{Number?} Number of entries to read.
     */
    readFloat32 = (n?: Number) => this.buffers.get(BinaryPool.FLOAT32).next(n)

    /**
     * Reads and returns an double-precision float or `Float64Array` when `n > 1`.
     * @param n{Number?} Number of entries to read.
     */
    readFloat64 = (n?: Number) => this.buffers.get(BinaryPool.FLOAT64).next(n)

    /**
     * Reads and returns a string.
     */
    readString = () => {
        let buffer = this.buffers.get(BinaryPool.UINT16)

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