/* @load-resource: '../shaders/fragment/texture-fragment.glsl' */
/* @load-resource: '../shaders/vertex/texture-vertex.glsl' */

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import Sprite from "../../sprite";
import {ByteArray} from "../../../serialization/binary/buffer";
import Uniform from "../uniform";
import CameraProgram from "./camera-program";
import Matrix3 from "../../../utils/matrix3";
import {Quadrangle} from "../../../utils/quadrangle";

export interface TextureProgramConfig {
    largeIndices: boolean
}

export const vertexShaderPath = "src/client/graphics/shaders/vertex/texture-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/texture-fragment.glsl"

export default class TextureProgram extends CameraProgram {
	public indexBufferType: number
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<ByteArray>;
	public textureUniform: Uniform;
	public transform: Matrix3;
	private vertices: number
    private updated: boolean;

    constructor(ctx: WebGLRenderingContext, options?: TextureProgramConfig) {
        options = Object.assign({
            largeIndices: false
        }, options)

        let vertexShader = new Shader(vertexShaderPath, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderPath, Shader.FRAGMENT).compile(ctx)
        super(vertexShader, fragmentShader)

        this.link(ctx)

        if(options.largeIndices) {
            if(!ctx.getExtension("OES_element_index_uint")) {
                throw new Error("No WebGL Extension: OES_element_index_uint. Please, update the browser.")
            }
        }

        const arrayType = options.largeIndices ? Uint32Array : Uint16Array
        this.indexBufferType = options.largeIndices ? ctx.UNSIGNED_INT : ctx.UNSIGNED_SHORT

        this.ctx = ctx
        this.vertexBuffer = this.registerBuffer(
            new GLBuffer({
                clazz: Float32Array,
                gl: ctx,
                drawMode: this.ctx.STATIC_DRAW,
                capacity: options.largeIndices ? 16384 : 128
            }).createBuffer(),
            [
                { name: "a_vertex_position", size: 3 },
                { name: "a_texture_position", size: 2 }
            ]
        ).glBuffer

        this.indexBuffer = new GLBuffer<ByteArray>({
            gl: ctx,
            clazz: arrayType,
            bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: options.largeIndices ? 16384 : 128
        }).createBuffer()

        this.textureUniform = this.getUniform("u_texture")
        this.matrixUniform = this.getUniform("u_matrix")
        this.vertices = 0
    }

    drawTexture(quadrangle: Quadrangle, sx: number, sy: number, sw: number, sh: number, z: number) {
        this.vertexBuffer.appendArray([
            quadrangle.x1, quadrangle.y1, z, sx + sw, sy + sh,
            quadrangle.x2, quadrangle.y2, z, sx + sw, sy,
            quadrangle.x3, quadrangle.y3, z, sx, sy + sh,
            quadrangle.x4, quadrangle.y4, z, sx, sy
        ])

        const baseIndex = this.vertices

        this.indexBuffer.appendArray([
            baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3
        ])

        this.vertices += 4
    }

    drawSprite(sprite: Sprite, quadrangle: Quadrangle, z: number = 1) {
        const r = sprite.rect;

        const sx = r.x
        const sy = r.y
        const sw = r.w
        const sh = r.h

        this.drawTexture(quadrangle, sx, sy, sw, sh, z)
    }

    reset() {
        this.updated = true
        this.indexBuffer.reset()
        this.vertexBuffer.reset()

        this.vertices = 0
    }

    bind() {
        super.bind()

        this.enableAttributes()
        this.setVertexAttributePointers()
    }

    draw() {
        if(this.updated === true) {
            this.vertexBuffer.sendDataToGPU()
            this.indexBuffer.sendDataToGPU()
        } else {
            this.indexBuffer.bind()
        }

        if(this.indexBuffer.pointer !== 0) {
            this.ctx.enable(this.ctx.DEPTH_TEST)
            this.ctx.disable(this.ctx.BLEND)

            this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBufferType, 0);
        }

        this.disableAttributes()
    }
}