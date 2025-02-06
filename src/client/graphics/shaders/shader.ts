
export default class Shader {
	public source: string;
	public type: GLenum;
	public raw: WebGLShader;
    static VERTEX = 0
    static FRAGMENT = 1

    constructor(source: string, type: number) {
        this.source = source
        this.type = type
        this.raw = null
    }

    compile(gl: WebGLRenderingContext) {
        this.raw = gl.createShader(this.type === Shader.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)

        gl.shaderSource(this.raw, this.source);
        gl.compileShader(this.raw);

        if (!gl.getShaderParameter(this.raw, gl.COMPILE_STATUS)) {
            throw new Error("Failed to compile shader: " + gl.getShaderInfoLog(this.raw));
        }

        return this
    }
}