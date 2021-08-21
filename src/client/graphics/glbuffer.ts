
import Buffer, {BufferConfig, ByteArray} from '../../serialization/binary/buffer';
import {Constructor} from "../../serialization/binary/serializable";

export interface GLBufferConfig<T> extends BufferConfig<T> {
    // Device-side element type
    glType?: GLenum;
    gl?: WebGLRenderingContext
    index?: number
    drawMode?: GLenum
    bufferType?: GLenum
}

export default class GLBuffer<T extends ByteArray> extends Buffer<T> {
	public gl: WebGLRenderingContext;
	public readonly glType: GLenum
    public readonly glElementSize: number
	public drawMode: GLenum;
	public bufferType: GLenum;
	public glBuffer: WebGLBuffer;
	public shouldUpdate: boolean;

    constructor(config: GLBufferConfig<T>) {
        super(config);

        this.gl = config.gl
        this.clazz = config.clazz
        this.drawMode = config.drawMode || this.gl.STATIC_DRAW
        this.bufferType = config.bufferType || this.gl.ARRAY_BUFFER
        this.glBuffer = null
        this.shouldUpdate = true

        this.glType = config.glType || this.defaultGLType()
        this.glElementSize = this.getGLElementSize(this.glType)
    }

    private defaultGLType() {
        switch (this.clazz as Constructor<ByteArray>) {
            case Float32Array: return this.gl.FLOAT;
            case Uint8Array:   return this.gl.UNSIGNED_BYTE;
            case Int8Array:    return this.gl.BYTE;
            case Uint16Array:  return this.gl.UNSIGNED_SHORT;
            case Int16Array:   return this.gl.SHORT;
            case Uint32Array:  return this.gl.UNSIGNED_INT;
            case Int32Array:   return this.gl.INT;
            default: throw new Error("Invalid buffer type")
        }
    }

    private getGLElementSize(glType: GLenum) {
        switch (glType) {
            case this.gl.FLOAT:          return 4;
            case this.gl.UNSIGNED_BYTE:  return 1;
            case this.gl.BYTE:           return 1;
            case this.gl.UNSIGNED_SHORT: return 2;
            case this.gl.SHORT:          return 2;
            case this.gl.UNSIGNED_INT:   return 4;
            case this.gl.INT:            return 4;
            default: throw new Error("Invalid buffer type")
        }
    }

    createBuffer() {
        super.createBuffer()
        this.glBuffer = this.gl.createBuffer()
        return this
    }

    extend(minimumCapacity?: number) {
        if(super.extend(minimumCapacity)) {
            this.shouldUpdate = true
            return true
        }
        return false
    }

    bind() {
        this.gl.bindBuffer(this.bufferType, this.glBuffer);
    }

    sendDataToGPU() {
        this.bind()
        if(this.shouldUpdate) {
            this.shouldUpdate = false
            this.gl.bufferData(this.bufferType, this.array, this.drawMode);
        } else {
            this.gl.bufferSubData(this.bufferType, 0, this.array)
        }
    }
}