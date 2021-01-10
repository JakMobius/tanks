
import Uniform from './uniform';
import GLBuffer from './glbuffer';
import Shader from "./shader";

class Program {
	public name: string;
	public shaders: Shader[];
	public raw: WebGLProgram;
	public ctx: WebGLRenderingContext;

    constructor(name: string, ...shaders: Shader[]) {
        this.name = name
        this.shaders = Array.prototype.slice.call(arguments, 1)
        this.raw = null
        this.ctx = null
    }

    link(gl: WebGLRenderingContext) {
        this.raw = gl.createProgram()
        for(let shader of this.shaders)
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

    use() {
        this.ctx.useProgram(this.raw)
    }

    prepare() {

    }
}

export default Program;