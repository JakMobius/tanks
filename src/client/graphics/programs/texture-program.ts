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
	public vertexPositionAttribute: number;
	public texturePositionAttribute: number;
	public textureUniform: Uniform;
	public vertexLength: number;
	public textures: number;
	public transform: Matrix3;
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
            let uintsForIndices = ctx.getExtension("OES_element_index_uint");
            if(!uintsForIndices) {
                throw new Error("No WebGL Extension: OES_element_index_uint. Please, update the browser.")
            }
        }

        const arrayType = options.largeIndices ? Uint32Array : Uint16Array
        this.indexBufferType = options.largeIndices ? ctx.UNSIGNED_INT : ctx.UNSIGNED_SHORT

        this.ctx = ctx
        this.vertexBuffer = new GLBuffer({
            clazz: Float32Array,
            gl: ctx,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: options.largeIndices ? 16384 : 128
        }).createBuffer()

        this.indexBuffer = new GLBuffer<ByteArray>({
            gl: ctx,
            clazz: arrayType,
            bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: options.largeIndices ? 16384 : 128
        }).createBuffer()

        this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
        this.texturePositionAttribute = this.getAttribute("a_texture_position");
        this.textureUniform = this.getUniform("u_texture")

        this.matrixUniform = this.getUniform("u_matrix")
        this.vertexLength = 4

        this.textures = 0
    }

    drawTexture(quadrangle: Quadrangle, sx: number, sy: number, sw: number, sh: number) {
        this.vertexBuffer.appendArray([
            quadrangle.x1, quadrangle.y1, sx + sw, sy + sh,
            quadrangle.x2, quadrangle.y2, sx + sw, sy,
            quadrangle.x3, quadrangle.y3, sx, sy + sh,
            quadrangle.x4, quadrangle.y4, sx, sy,
        ])

        const baseIndex = this.textures * 4

        this.indexBuffer.appendArray([
            baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3
        ])

        this.textures ++
    }

    drawSprite(sprite: Sprite, quadrangle: Quadrangle) {
        const r = sprite.rect;

        const sx = r.x
        const sy = r.y
        const sw = r.w
        const sh = r.h

        this.drawTexture(quadrangle, sx, sy, sw, sh)
    }

    reset() {
        this.updated = true
        this.indexBuffer.reset()
        this.vertexBuffer.reset()
    }

    bind() {
        super.bind()
        this.vertexBuffer.bind()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.enableVertexAttribArray(this.texturePositionAttribute);

        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
        this.ctx.vertexAttribPointer(this.texturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 8);
    }

    draw() {
        if(this.updated === true) {
            this.indexBuffer.updateData()
            this.vertexBuffer.updateData()
        } else {
            this.indexBuffer.bind()
        }

        if(this.indexBuffer.pointer !== 0) {
            this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBufferType, 0);
        }

        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.disableVertexAttribArray(this.texturePositionAttribute);

        this.textures = 0
    }
}