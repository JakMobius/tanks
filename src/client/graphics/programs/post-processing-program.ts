
/* @load-resource: '../shaders/fragment/post-processing-fragment.glsl' */
/* @load-resource: '../shaders/vertex/post-processing-vertex.glsl' */

import GLBuffer from '../glbuffer';
import Uniform from "../uniform";
import VertexFragmentShaderProgram from "./vertex-fragment-shader-program";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/post-processing-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/post-processing-fragment.glsl"

export default class PostProcessingProgram extends VertexFragmentShaderProgram {
    public vertexBuffer: GLBuffer<Float32Array>;
    public indexBuffer: GLBuffer<Uint8Array>;
    public textureUniform: Uniform;
    public widthUniform: Uniform;
    public heightUniform: Uniform;

    constructor(ctx: WebGLRenderingContext) {
        super(vertexShaderPath, fragmentShaderPath, ctx)

        this.vertexBuffer = this.createVertexArrayBuffer({
            clazz: Float32Array,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: 8,
            attributes: this.createVertexArrayAttributes([
                { name: "a_vertex_position", size: 2 }
            ])
        })

        this.indexBuffer = this.createIndexBuffer(Uint8Array, 8)

        this.vertexBuffer.appendArray([
            -1, -1,
            -1, 1,
            1, -1,
            1, 1
        ])

        this.indexBuffer.appendArray([
            0, 1, 3, 0, 2, 3
        ])

        this.indexBuffer.bindAndSendDataToGPU()
        this.vertexBuffer.bindAndSendDataToGPU()

        this.textureUniform = this.getUniform("u_texture")
        this.widthUniform = this.getUniform("u_screen_width")
        this.heightUniform = this.getUniform("u_screen_height")
    }

    draw() {
        this.ctx.disable(this.ctx.DEPTH_TEST)
        this.ctx.disable(this.ctx.BLEND)

        this.widthUniform.set1f(this.ctx.canvas.width)
        this.heightUniform.set1f(this.ctx.canvas.height)

        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBuffer.glType, 0);
    }
}