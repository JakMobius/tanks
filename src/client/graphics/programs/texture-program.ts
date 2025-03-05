import GLBuffer from 'src/client/graphics/gl/glbuffer';
import Sprite from "src/client/graphics/sprite";
import Uniform from "src/client/graphics/gl/uniform";
import CameraProgram from "./camera-program";
import { Matrix3 } from "src/utils/matrix3";
import {copyQuadrangle, Quadrangle, transformQuadrangle} from "src/utils/quadrangle";
import {ByteArray} from "src/serialization/binary/typed-buffer";

import vertexShaderSource from "src/client/graphics/shaders/vertex/texture-vertex.glsl"
import fragmentShaderSource from "src/client/graphics/shaders/fragment/texture-fragment.glsl"

export interface TextureProgramConfig {
    largeIndices: boolean
    vertexShaderSource?: string
    fragmentShaderSource?: string
}

export default class TextureProgram extends CameraProgram {
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<ByteArray>;
	public textureUniform: Uniform;
	public transform = new Matrix3();
	private vertices: number
    private updated: boolean;

    constructor(ctx: WebGLRenderingContext, options?: TextureProgramConfig) {
        options = Object.assign({
            // largeIndices: false,
            largeIndices: true,
            vertexShaderSource: vertexShaderSource,
            fragmentShaderSource: fragmentShaderSource
        }, options)

        super(options.vertexShaderSource, options.fragmentShaderSource, ctx)

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

        let copy = copyQuadrangle(quadrangle)
        transformQuadrangle(copy, this.transform)
        
        this.vertexBuffer.appendArray([
            copy.x1, copy.y1, z, sx + sw, sy + sh,
            copy.x2, copy.y2, z, sx + sw, sy,
            copy.x3, copy.y3, z, sx, sy + sh,
            copy.x4, copy.y4, z, sx, sy
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
            this.updateBuffers()
            this.updated = false
        } else {
            this.indexBuffer.bind()
        }

        this.ctx.enable(this.ctx.DEPTH_TEST)
        this.ctx.disable(this.ctx.BLEND)

        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBuffer.glType, 0);
    }

    updateBuffers() {
        this.vertexBuffer.bindAndSendDataToGPU()
        this.indexBuffer.bindAndSendDataToGPU()
    }
}