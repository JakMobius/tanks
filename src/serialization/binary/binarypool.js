
const Buffer = require('./buffer')

class BinaryPool {
    static INT8 = 0;
    static UINT8 = 1;
    static INT16 = 2;
    static UINT16 = 3;
    static INT32 = 4;
    static UINT32 = 5;
    static FLOAT32 = 6;
    static FLOAT64 = 7;

    static bufferTypes = new Map([
        [this.INT8, new Buffer({
            clazz: Int8Array,
            capacity: 128
        })],
        [this.UINT8, new Buffer({
            clazz: Uint8Array,
            capacity: 128
        })],
        [this.INT16, new Buffer({
            clazz: Int16Array,
            capacity: 128
        })],
        [this.UINT16, new Buffer({
            clazz: Uint16Array,
            capacity: 128
        })],
        [this.INT32, new Buffer({
            clazz: Int32Array,
            capacity: 128
        })],
        [this.UINT32, new Buffer({
            clazz: Uint32Array,
            capacity: 128
        })],
        [this.FLOAT32, new Buffer({
            clazz: Float32Array,
            capacity: 128
        })],
        [this.FLOAT64, new Buffer({
            clazz: Float64Array,
            capacity: 128
        })]
    ])
}

module.exports = BinaryPool