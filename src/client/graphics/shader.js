
const shaders = require("./shaderloader")

class Shader {
    static VERTEX = 0
    static FRAGMENT = 1

    constructor(name, type) {
        this.name = name
        this.type = type
        this.raw = null
    }

    compile(gl) {
        this.raw = gl.createShader(this.type === Shader.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)

        if(!shaders[this.name]) {
            throw new Error("No such shader: " + this.name)
        }

        gl.shaderSource(this.raw, shaders[this.name]);
        gl.compileShader(this.raw);

        if (!gl.getShaderParameter(this.raw, gl.COMPILE_STATUS)) {
            throw new Error("Failed to compile shader '" + this.name + "': " + gl.getShaderInfoLog(this.raw));
        }

        return this
    }
}

module.exports = Shader