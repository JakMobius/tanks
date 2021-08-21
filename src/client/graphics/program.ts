
import Uniform from './uniform';
import GLBuffer from './glbuffer';
import Shader from "./shader";
import {ByteArray} from "../../serialization/binary/buffer";

export interface VertexAttribute {
    index: number,
    buffer: GLBuffer<any>,
    normalized: boolean,
    size: number
}

export type AttributeDef = {
    name: string,
    size?: 1 | 2 | 3 | 4,
    normalized?: boolean
}

export interface ProgramBuffer<T extends ByteArray> {
    glBuffer: GLBuffer<T>
    attributes: VertexAttribute[]
    vertexStride: number
}

export default abstract class Program {
    public shaders: Shader[];
    public raw: WebGLProgram;
    public ctx: WebGLRenderingContext;
    private registeredVertexAttributes: VertexAttribute[] = [];
    private registeredBuffers: ProgramBuffer<any>[] = []

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

        if (!gl.getProgramParameter(this.raw, gl.LINK_STATUS)) {
            throw new Error("Failed to link bodyProgram: " + gl.getProgramInfoLog(this.raw));
        }
        this.ctx = gl
        return this
    }

    createIndexBuffer() {
        return new GLBuffer({
            gl: this.ctx,
            clazz: Uint16Array,
            bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
            drawMode: this.ctx.STATIC_DRAW
        }).createBuffer()
    }

    getUniform(name: string) {
        return new Uniform(this, name)
    }

    getAttribute(name: string) {
        return this.ctx.getAttribLocation(this.raw, name);
    }

    registerAttribute(def: AttributeDef, buffer: GLBuffer<any>) {
        const attribute = {
            index: this.getAttribute(def.name),
            buffer: buffer,
            normalized: def.normalized ?? false,
            size: def.size
        }
        this.registeredVertexAttributes.push(attribute)
        return attribute
    }

    enableAttributes() {
        for(let attribute of this.registeredVertexAttributes) {
            this.ctx.enableVertexAttribArray(attribute.index)
        }
    }

    disableAttributes() {
        for(let attribute of this.registeredVertexAttributes) {
            this.ctx.disableVertexAttribArray(attribute.index)
        }
    }

    registerBuffer<T extends ByteArray>(glBuffer: GLBuffer<T>, attributes: AttributeDef[]) {

        let vertexStride = 0
        for(let attribute of attributes) {
            vertexStride += glBuffer.glElementSize * attribute.size
        }

        const buffer: ProgramBuffer<T> = {
            glBuffer: glBuffer,
            attributes: attributes.map(def => this.registerAttribute(def, glBuffer)),
            vertexStride: vertexStride
        }

        this.registeredBuffers.push(buffer)
        return buffer
    }

    setVertexAttributePointers() {
        for(let buffer of this.registeredBuffers) {
            buffer.glBuffer.bind()
            let offset = 0
            for(let attribute of buffer.attributes) {
                this.ctx.vertexAttribPointer(attribute.index, attribute.size, buffer.glBuffer.glType, attribute.normalized, buffer.vertexStride, offset)
                offset += attribute.size * buffer.glBuffer.glElementSize
            }

        }
    }

    bind() {
        this.ctx.useProgram(this.raw)
    }

    abstract draw(): void
    abstract reset(): void
}