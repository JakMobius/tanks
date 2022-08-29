import Uniform from '../uniform';
import GLBuffer from '../glbuffer';
import Shader from "../shader";
import VertexArrayBuffer, {VertexArrayBufferConfig, VertexAttribute} from "../vertex-array-buffer";
import {ByteArray, ByteArrayConstructor} from "../../../serialization/binary/typed-buffer";

export type AttributeConfig = {
    name: string,
    size?: 1 | 2 | 3 | 4,
    normalized?: boolean
}

export default abstract class Program {
    public shaders: Shader[];
    public raw: WebGLProgram;
    public ctx: WebGLRenderingContext;
    private registeredBuffers: VertexArrayBuffer<any>[] = []

    protected constructor(...shaders: Shader[]) {
        this.shaders = Array.prototype.slice.call(arguments)
        this.raw = null
        this.ctx = null
    }

    link(gl: WebGLRenderingContext) {
        this.raw = gl.createProgram()
        for (let shader of this.shaders)
            gl.attachShader(this.raw, shader.raw)
        gl.linkProgram(this.raw)
        gl.validateProgram(this.raw)

        if (!gl.getProgramParameter(this.raw, gl.LINK_STATUS)) {
            throw new Error("Failed to link program: " + gl.getProgramInfoLog(this.raw));
        }

        if (!gl.getProgramParameter(this.raw, gl.VALIDATE_STATUS)) {
            throw new Error("Failed to validate program: " + gl.getProgramInfoLog(this.raw));
        }

        this.ctx = gl
        return this
    }

    createIndexBuffer<T extends ByteArray>(type: ByteArrayConstructor<T>, capacity?: number): GLBuffer<T> {
        return new GLBuffer({
            gl: this.ctx,
            clazz: type,
            bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: capacity
        }).createBuffer()
    }

    getUniform(name: string) {
        return new Uniform(this, name)
    }

    getAttribute(name: string) {
        return this.ctx.getAttribLocation(this.raw, name);
    }

    enableAttributes() {
        for(let buffer of this.registeredBuffers) {
            for(let attribute of buffer.attributes) {
                this.ctx.enableVertexAttribArray(attribute.index)
            }
        }
    }

    disableAttributes() {
        for(let buffer of this.registeredBuffers) {
            for(let attribute of buffer.attributes) {
                this.ctx.disableVertexAttribArray(attribute.index)
            }
        }
    }

    createVertexArrayAttributes(configs: AttributeConfig[]): VertexAttribute[] {
        return configs.map(config => this.createVertexArrayAttribute(config))
    }

    createVertexArrayAttribute(config: AttributeConfig): VertexAttribute {
        return {
            index: this.getAttribute(config.name),
            normalized: config.normalized ?? false,
            size: config.size
        }
    }

    createVertexArrayBuffer<T extends ByteArray>(config: VertexArrayBufferConfig<T>): VertexArrayBuffer<T> {
        if(!config.gl) config.gl = this.ctx

        const vertexArrayBuffer = new VertexArrayBuffer(config).createBuffer()
        vertexArrayBuffer.createBuffer()

        this.registeredBuffers.push(vertexArrayBuffer)
        return vertexArrayBuffer
    }

    setVertexAttributePointers() {
        for(let buffer of this.registeredBuffers) {
            buffer.bind()
            let offset = 0
            for(let attribute of buffer.attributes) {
                this.ctx.vertexAttribPointer(attribute.index, attribute.size, buffer.glType, attribute.normalized, buffer.vertexStride, offset)
                offset += attribute.size * buffer.glElementSize
            }

        }
    }

    getExtension(extension: string): any {
        return this.ctx.getExtension(extension)
    }

    getExtensionOrThrow(name: string) {
        const extension = this.ctx.getExtension(name)
        if (!extension) {
            throw new Error("No WebGL Extension: " + name)
        }
        return extension
    }

    shouldDraw(): boolean {
        return true
    }

    bind() {
        this.ctx.useProgram(this.raw)
        this.enableAttributes()
        this.setVertexAttributePointers()
    }

    abstract draw(): void

    clean() {
        this.disableAttributes()
    }

    reset() {

    }
}