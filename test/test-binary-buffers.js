
const Buffer = require("../src/serialization/binary/buffer")
const BinaryEncoder = require("../src/serialization/binary/binary-encoder")
const BinaryDecoder = require("../src/serialization/binary/binary-decoder")
const mocha = require("mocha")
const chai = require("chai")

const assert = chai.assert
const describe = mocha.describe
const it = mocha.it
const before = mocha.before
const after = mocha.after
const beforeEach = mocha.beforeEach

describe("Binary buffer", function(){
    let buffer;

    beforeEach("create new buffer", function () {
        buffer = new Buffer({
            clazz: Uint8Array,
            capacity: 8
        })
        buffer.createBuffer()
    })

    it('should store binary information', function () {
        let data = [1, 2, 3, 4, 5, 6, 7, 8]

        for(let item of data) buffer.push(item)

        assert.deepEqual(Array.prototype.slice.call(buffer.array), data)
        assert.strictEqual(buffer.capacity, 8, "Buffer expanded too early")
    });

    it('should expand itself to store more data', function () {
        let data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

        for(let item of data) buffer.push(item)

        assert.deepEqual(Array.prototype.slice.call(buffer.array), data)
    });

    it('should store binary arrays', function() {
        let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])

        buffer.push(128)
        buffer.appendArray(data)

        buffer.reset()
        assert.strictEqual(buffer.next(), 128)
        assert.deepEqual(Array.prototype.slice.call(buffer.next(data.length)), Array.prototype.slice.call(data))
    })
});

describe('Binary pool', function() {
    let encoder;
    let decoder;

    beforeEach("create new pool", function () {
        encoder = new BinaryEncoder()
        decoder = new BinaryDecoder()
    })

    function randomInteger(from, to) {
        return Math.round(Math.random() * (to - from) + from)
    }

    function randomIntegers(from, to, count) {
        let array = []
        while(count--) {
            array.push(randomInteger(from, to))
        }
        return array
    }

    function randomFloat32(from, to) {
        return new Float32Array([Math.random() * (to - from) + from])[0]
    }

    function randomFloats32(from, to, count) {
        let array = []
        while(count--) {
            array.push(randomFloat32(from, to))
        }
        return array
    }

    function randomFloat64(from, to) {
        return new Float64Array([Math.random() * (to - from) + from])[0]
    }

    function randomFloats64(from, to, count) {
        let array = []
        while(count--) {
            array.push(randomFloat64(from, to))
        }
        return array
    }

    it("should store mixed data", function() {

        let int8 = randomIntegers(-127, 127, 100)
        let uint8 = randomIntegers(0, 255, 100)
        let int16 = randomIntegers(-32768, 32767, 100)
        let uint16 = randomIntegers(0, 65535, 100)
        let int32 = randomIntegers(-2147483648, 2147483647, 100)
        let uint32 = randomIntegers(0, 4294967295, 100)
        let float32 = randomFloats32(-1000000000, 1000000000, 100)
        let float64 = randomFloats64(-1000000000, 1000000000, 100)

        let string = "The quick brown fox jumps over the lazy dog"

        for(let n of int8) encoder.writeInt8(n)
        for(let n of uint8) encoder.writeUint8(n)
        for(let n of int16) encoder.writeInt16(n)
        for(let n of uint16) encoder.writeUint16(n)
        for(let n of int32) encoder.writeInt32(n)
        for(let n of uint32) encoder.writeUint32(n)
        for(let n of float32) encoder.writeFloat32(n)
        for(let n of float64) encoder.writeFloat64(n)
        encoder.writeString(string)

        let result = encoder.compile()

        decoder.readData(result)

        for(let n of int8) assert.strictEqual(decoder.readInt8(), n)
        for(let n of uint8) assert.strictEqual(decoder.readUint8(), n)
        for(let n of int16) assert.strictEqual(decoder.readInt16(), n)
        for(let n of uint16) assert.strictEqual(decoder.readUint16(), n)
        for(let n of int32) assert.strictEqual(decoder.readInt32(), n)
        for(let n of uint32) assert.strictEqual(decoder.readUint32(), n)
        for(let n of float32) assert.strictEqual(decoder.readFloat32(), n)
        for(let n of float64) assert.strictEqual(decoder.readFloat64(), n)

        assert.strictEqual(decoder.readString(), string)
    })

    it('should ignore unused types', function() {
        let int8 = randomIntegers(-127, 127, 100)
        let int16 = randomIntegers(-32768, 32767, 100)
        let int32 = randomIntegers(-2147483648, 2147483647, 100)
        let float64 = randomFloats64(-1000000000, 1000000000, 100)

        for(let n of int8) encoder.writeInt8(n)
        for(let n of int16) encoder.writeInt16(n)
        for(let n of int32) encoder.writeInt32(n)
        for(let n of float64) encoder.writeFloat64(n)

        let result = encoder.compile()

        decoder.readData(result)

        for(let n of int8) assert.strictEqual(decoder.readInt8(), n)
        for(let n of int16) assert.strictEqual(decoder.readInt16(), n)
        for(let n of int32) assert.strictEqual(decoder.readInt32(), n)
        for(let n of float64) assert.strictEqual(decoder.readFloat64(), n)
    })

})
