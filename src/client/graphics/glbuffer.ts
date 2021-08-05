
import Buffer, {BufferConfig, ByteArray} from '../../serialization/binary/buffer';

export interface GLBufferConfig<T> extends BufferConfig<T> {
    gl?: WebGLRenderingContext
    index?: number
    drawMode?: GLenum
    bufferType?: GLenum
}

export default class GLBuffer<T extends ByteArray> extends Buffer<T> {
	public gl: WebGLRenderingContext;
	//public index: number;
	public drawMode: GLenum;
	public bufferType: GLenum;
	public glBuffer: WebGLBuffer;
	public shouldUpdate: boolean;

    constructor(config: GLBufferConfig<T>) {
        super(config);

        this.gl = config.gl
        //this.index = config.index
        this.clazz = config.clazz
        this.drawMode = config.drawMode || this.gl.STATIC_DRAW
        this.bufferType = config.bufferType || this.gl.ARRAY_BUFFER
        this.glBuffer = null
        this.shouldUpdate = true
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

    updateData() {
        this.bind()
        if(this.shouldUpdate) {
            this.shouldUpdate = false
            this.gl.bufferData(this.bufferType, this.array, this.drawMode);
        } else {
            this.gl.bufferSubData(this.bufferType, 0, this.array)
        }
    }
}