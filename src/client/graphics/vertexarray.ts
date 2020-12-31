
class VertexArray {
	public gl: any;
	public raw: any;

    constructor(gl) {
        this.gl = gl
        this.raw = gl.createVertexArray()
    }

    bind() {
        this.gl.bindVertexArray(this.raw)
    }
}

export default VertexArray;