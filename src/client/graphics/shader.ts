
import { Shaders } from './shaderloader'

class Shader {
	public name: string;
	public type: GLenum;
	public raw: WebGLShader;
    static VERTEX = 0
    static FRAGMENT = 1

    constructor(name: string, type: number) {
        this.name = name
        this.type = type
        this.raw = null
    }

    compile(gl: WebGLRenderingContext) {
        this.raw = gl.createShader(this.type === Shader.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)

        if(!Shaders[this.name]) {
            throw new Error("No such shader: " + this.name)
        }

        gl.shaderSource(this.raw, Shaders[this.name]);
        gl.compileShader(this.raw);

        if (!gl.getShaderParameter(this.raw, gl.COMPILE_STATUS)) {
            throw new Error("Failed to compile shader '" + this.name + "': " + gl.getShaderInfoLog(this.raw));
        }

        return this
    }
}

export default Shader;