
class Buffer {
	public initialCapacity: any;
	public array: any;
	public stack: any;
    /**
     * Buffer base capacity.
     * If the `initialCapacity` equals to
     * 128, then buffer actual capacity
     * is multiply of 128.
     * @type {Number|Null}
     */
    capacity = null

    /**
     * Buffer internal class type.
     * @type {Class<TypedArray>}
     */
    clazz = null

    /**
     * Current entry pointer. Increased
     * when reading or writing data.
     * @type {number}
     */
    pointer = 0

    constructor(options) {
        this.initialCapacity = options.capacity || 128
        this.capacity = 0
        this.clazz = options.clazz
        this.pointer = 0
        this.array = null
        this.stack = []
    }

    /**
     * Initializes the buffer. It's required to
     * call this method if you want to
     * use the dynamic buffer.
     */

    createBuffer() {
        this.capacity = this.initialCapacity
        this.array = new (this.clazz)(this.capacity)
        return this
    }

    /**
     * if `minimumCapacity` parameter is provided, extends the
     * buffer to nearest greater multiple of `capacity`
     * bytes. if not, extends the buffer by `capacity` bytes.
     * If the required number of bytes if less then actual
     * capacity, this method does nothing
     * @param minimumCapacity {Number?} Minimum buffer capacity.
     * @returns {boolean} `true`, if buffer has been reallocated, `false` otherwise
     */

    extend(minimumCapacity?) {
        if (minimumCapacity === undefined) {
            this.capacity += this.initialCapacity
        } else {
            if (minimumCapacity <= this.capacity)
                return false
            this.capacity = Math.ceil(minimumCapacity / this.initialCapacity) * this.initialCapacity
        }

        let oldBuffer = this.array
        this.array = new (this.clazz)(this.capacity)
        this.array.set(oldBuffer)

        return true
    }

    /**
     * Resets the pointer to zero, allowing
     * to read buffer from start or reuse
     * it by overwriting old content.
     */

    reset() {
        this.pointer = 0
    }

    /**
     * Converts this dynamic buffer into static `ArrayBuffer`
     * @returns {ArrayBuffer}
     */

    toArrayBuffer() {
        return this.array.buffer.slice(0, this.pointer * this.clazz.BYTES_PER_ELEMENT)
    }

    /**
     * Appends single value to the end of this buffer.
     * The value should bound to the buffer type,
     * otherwise it will be clamped.
     * @param value {Number}
     */

    push(value) {
        if(this.pointer >= this.capacity) {
            this.extend()
        }
        this.array[this.pointer++] = value
    }

    /**
     * Appends `Array` to the end of this buffer.
     * @param array {Array|TypedArray} Array to append.
     */

    appendArray(array) {
        let newSize = this.pointer + array.length
        if(newSize >= this.capacity) {
            this.extend(newSize)
        }

        this.array.set(array, this.pointer)
        this.pointer += array.length
    }

    /**
     * Appends another buffer to the end of this buffer.
     * Usable when compiling multiple buffers into one.
     * @param buffer {Buffer} Buffer to append.
     */

    appendBuffer(buffer) {
        if(buffer.pointer === 0) {
            return
        }

        let bytes = buffer.array.BYTES_PER_ELEMENT
        let selfBytes = this.array.BYTES_PER_ELEMENT

        let size = Math.ceil( bytes / selfBytes * buffer.pointer)

        let alignment = Math.max(bytes, selfBytes)

        // Align pointer

        this.pointer = Math.ceil(this.pointer * selfBytes / alignment) * alignment / selfBytes
        let temp = new (this.clazz)(buffer.array.buffer, 0, size)

        this.appendArray(temp)
    }

    /**
     * Reads `TypedArray` to internal buffer. Then it's
     * possible to use `next(n)` method.
     * @param array {TypedArray} An array to read data. Should be the same type as the buffer.
     * @param pointer {Number} How many bytes to skip before start reading.
     * @param size {Number} Number of overlay to read
     */
    read(array, pointer, size) {
        this.extend(size)
        let buffer = new (this.clazz)(array, pointer, size)
        this.array.set(buffer)

        // Allow to read buffer from begin with `next` method

        this.pointer = 0
    }

    next(n) {
        if(n === undefined || n <= 1) {
            return this.array[this.pointer++]
        } else if(typeof n == "number") {
            let temp = this.array.slice(this.pointer, this.pointer + n)
            this.pointer += n
            return temp
        }
    }

    /**
     * Makes a new buffer with the same options.
     * Does not copy buffer content.
     * @returns {Buffer}
     */

    clone() {
        return new Buffer({
            capacity: this.initialCapacity,
            clazz: this.clazz
        })
    }

    /**
     * Saves current buffer pointer to stack.
     * Return to last saved pointer
     * by calling `restore` method.
     */

    save() {
        this.stack.push(this.pointer)
    }

    /**
     * Returns to last saved buffer pointer.
     * See also `save` method.
     */

    restore() {
        this.pointer = this.stack.pop()
    }
}

export default Buffer;
