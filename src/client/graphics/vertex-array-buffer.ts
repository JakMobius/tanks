import GLBuffer, {GLBufferConfig} from "./glbuffer";
import {ByteArray} from "../../serialization/binary/typed-buffer";

export interface VertexAttribute {
    index: number,
    normalized: boolean,
    size: 1 | 2 | 3 | 4
}

export interface VertexArrayBufferConfig<T extends ByteArray> extends GLBufferConfig<T> {
    attributes: VertexAttribute[]
}

export default class VertexArrayBuffer<T extends ByteArray> extends GLBuffer<T> {
    vertexStride: number = 0
    attributes: VertexAttribute[]

    constructor(config: VertexArrayBufferConfig<T>) {
        super(config);

        for(let attribute of config.attributes) {
            this.vertexStride += this.glElementSize * attribute.size
        }

        this.attributes = config.attributes
    }


}