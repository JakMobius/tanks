
/* @load-resource: '../shaders/fragment/post-processing-fragment.glsl' */
/* @load-resource: '../shaders/vertex/post-processing-vertex.glsl' */

import Program from '../program';

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import Uniform from "../uniform";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/post-processing-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/post-processing-fragment.glsl"

export default class PostProcessingProgram extends Program {
    public vertexBuffer: GLBuffer<Float32Array>;
    public indexBuffer: GLBuffer<Uint8Array>;
    public vertexPositionAttribute: any;
    public textureUniform: Uniform;
    public widthUniform: Uniform;
    public heightUniform: Uniform;
    public vertexLength: number;
    public textures: number;

    constructor(name: string, ctx: WebGLRenderingContext) {
        let vertexShader = new Shader(vertexShaderPath, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderPath, Shader.FRAGMENT).compile(ctx)

        super(vertexShader, fragmentShader)

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

        this.indexBuffer.sendDataToGPU()
        this.vertexBuffer.sendDataToGPU()

        this.vertexPositionAttribute = this.registerAttribute("a_vertex_position");
        this.textureUniform = this.getUniform("u_texture")
        this.widthUniform = this.getUniform("u_screen_width")
        this.heightUniform = this.getUniform("u_screen_height")
        this.vertexLength = 2
    }

    reset() {

    }

    bind() {
        super.bind()
        this.indexBuffer.bind()
        this.vertexBuffer.bind()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.widthUniform.set1f(this.ctx.canvas.width)
        this.heightUniform.set1f(this.ctx.canvas.height)

        this.enableAttributes()

        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
    }

    draw() {

        if(this.indexBuffer.pointer !== 0) {
            this.ctx.disable(this.ctx.DEPTH_TEST)
            this.ctx.disable(this.ctx.BLEND)

            this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_BYTE, 0);
        }

        this.disableAttributes()

        this.textures = 0
    }
}