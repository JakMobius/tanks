
import Buffer, {ByteArray, ByteArrayConstructor} from './buffer';
import {Constructor} from "./serializable";

class BinaryPool {
    static bufferTypes: Map<ByteArrayConstructor<ByteArray>, Buffer<ByteArray>> = new Map()
}

export default BinaryPool;

let types: ByteArrayConstructor<ByteArray>[] = [
    Int8Array,
    Uint8Array,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
]

for(let type of types) {
    BinaryPool.bufferTypes.set(type, new Buffer<ByteArray>({
        clazz: type,
        capacity: 128
    }))
}
