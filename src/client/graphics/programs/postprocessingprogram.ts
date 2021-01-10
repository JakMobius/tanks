
/* @load-resource: '../shaders/fragment/post-processing-fragment.glsl' */
/* @load-resource: '../shaders/vertex/post-processing-vertex.glsl' */

import Program from '../program';

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import Uniform from "../uniform";

class PostProcessingProgram extends Program {
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<Uint8Array>;
	public vertexPositionAttribute: any;
	public textureUniform: Uniform;
	public widthUniform: Uniform;
	public heightUniform: Uniform;
	public vertexLength: number;
	public texturePositionAttribute: number;
	public textures: number;

    constructor(name: string, ctx: WebGLRenderingContext) {
        let vertexShader = new Shader("post-processing-vertex", Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader("post-processing-fragment", Shader.FRAGMENT).compile(ctx)

        super(name, vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx

        this.vertexBuffer = new GLBuffer({
            clazz: Float32Array,
            gl: this.ctx,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: 8
        }).createBuffer()

        this.vertexBuffer.appendArray([
            -1, -1,
            -1, 1,
            1, -1,
            1, 1
        ])

        this.indexBuffer = new GLBuffer({
            clazz: Uint8Array,
            gl: this.ctx,
            bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: 8
        }).createBuffer()

        this.indexBuffer.appendArray([
            0, 1, 3, 0, 2, 3
        ])

        this.indexBuffer.updateData()
        this.vertexBuffer.updateData()

        this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
        this.textureUniform = this.getUniform("u_texture")
        this.widthUniform = this.getUniform("u_screen_width")
        this.heightUniform = this.getUniform("u_screen_height")
        this.vertexLength = 2
    }

    draw() {
        this.indexBuffer.bind()
        this.vertexBuffer.bind()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.widthUniform.set1f(this.ctx.canvas.width)
        this.heightUniform.set1f(this.ctx.canvas.height)

        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.enableVertexAttribArray(this.texturePositionAttribute);

        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);

        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_BYTE, 0);

        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);

        this.textures = 0
    }
}

export default PostProcessingProgram;