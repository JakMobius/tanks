/* @load-resource: '../shaders/fragment/texture-fragment.glsl' */
/* @load-resource: '../shaders/vertex/texture-vertex.glsl' */

import GLBuffer from '../glbuffer';
import Sprite from "src/client/sprite";
import Uniform from "../uniform";
import CameraProgram from "./camera-program";
import Matrix3 from "src/utils/matrix3";
import {Quadrangle} from "src/utils/quadrangle";
import {ByteArray} from "src/serialization/binary/typed-buffer";

export interface TextureProgramConfig {
    largeIndices: boolean
}

export const vertexShaderPath = "src/client/graphics/shaders/vertex/texture-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/texture-fragment.glsl"

export default class TextureProgram extends CameraProgram {
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

        super(vertexShaderPath, fragmentShaderPath, ctx)

        if(options.largeIndices) this.getExtensionOrThrow("OES_element_index_uint")

        this.vertexBuffer = this.createVertexArrayBuffer({
            clazz: Float32Array,
            drawMode: this.ctx.STATIC_DRAW,
            attributes: this.createVertexArrayAttributes([
                { name: "a_vertex_position", size: 3 },
                { name: "a_texture_position", size: 2 }
            ])
        })

        this.indexBuffer = this.createIndexBuffer<ByteArray>(options.largeIndices ? Uint32Array : Uint16Array)

        this.textureUniform = this.getUniform("u_texture")
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

    shouldDraw(): boolean {
        return this.indexBuffer.pointer !== 0
    }

    draw() {
        if(this.updated === true) {
            this.vertexBuffer.bindAndSendDataToGPU()
            this.indexBuffer.bindAndSendDataToGPU()
            this.updated = false
        } else {
            this.indexBuffer.bind()
        }

        this.ctx.enable(this.ctx.DEPTH_TEST)
        this.ctx.disable(this.ctx.BLEND)

        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBuffer.glType, 0);
    }
}