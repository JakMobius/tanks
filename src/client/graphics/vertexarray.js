
class VertexArray {
    constructor(gl) {
        this.gl = gl
        this.raw = gl.createVertexArray()
    }

    bind() {
        this.gl.bindVertexArray(this.raw)
    }
}

module.exports = VertexArray