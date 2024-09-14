/* @load-resource: '../shaders/fragment/colored-texture-fragment.glsl' */
/* @load-resource: '../shaders/vertex/colored-texture-vertex.glsl' */

import GLBuffer from 'src/client/graphics/gl/glbuffer';
import {Quadrangle} from "src/utils/quadrangle";
import {ByteArray} from "src/serialization/binary/typed-buffer";
import TextureProgram, {TextureProgramConfig} from "src/client/graphics/programs/texture-program";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/colored-texture-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/colored-texture-fragment.glsl"

export default class ColoredTextureProgram extends TextureProgram {
    private colorBuffer: GLBuffer<Uint32Array>;

    private currentColor: number

    constructor(ctx: WebGLRenderingContext, options?: TextureProgramConfig) {
        options = Object.assign({
            largeIndices: false,
            vertexShaderPath: vertexShaderPath,
            fragmentShaderPath: fragmentShaderPath
        }, options)

        super(ctx, options)

        this.currentColor = 0xFFFFFFFF
        this.colorBuffer = this.createVertexArrayBuffer({
            clazz: Uint32Array,
            glType: this.ctx.UNSIGNED_BYTE,
            drawMode: this.ctx.STATIC_DRAW,
            attributes: this.createVertexArrayAttributes([
                { name: "a_color", size: 4, normalized: true }
            ])
        })

        this.indexBuffer = this.createIndexBuffer<ByteArray>(options.largeIndices ? Uint32Array : Uint16Array)
    }

    setColor(color: number) {
        this.currentColor = color
    }

    drawTexture(quadrangle: Quadrangle, sx: number, sy: number, sw: number, sh: number, z: number) {
        super.drawTexture(quadrangle, sx, sy, sw, sh, z)
        for(let i = 0; i < 4; i++) this.colorBuffer.push(this.currentColor)
    }

    reset() {
        super.reset()
        this.colorBuffer.reset()
    }

    updateBuffers() {
        super.updateBuffers()
        this.colorBuffer.bindAndSendDataToGPU()
    }
}