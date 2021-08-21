/* @load-resource: '../../shaders/fragment/light-mask-texture-fragment.glsl' */
/* @load-resource: '../../shaders/vertex/light-mask-texture-vertex.glsl' */

import Shader from '../../shader';
import GLBuffer from '../../glbuffer';
import Sprite from '../../../sprite';
import Uniform from "../../uniform";
import CameraProgram from "../camera-program";
import {Quadrangle} from "../../../../utils/quadrangle";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/light-mask-texture-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/light-mask-texture-fragment.glsl"

export default class LightMaskTextureProgram extends CameraProgram {
	public vertexBuffer: GLBuffer<Float32Array>;
	public samplerUniform: Uniform;
	public textureSizeUniform: Uniform;
	public angleUniform: Uniform;
	public vertices: number

    constructor(ctx: WebGLRenderingContext) {

        let vertexShader = new Shader(vertexShaderPath, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderPath, Shader.FRAGMENT).compile(ctx)
        super(vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx
        this.vertexBuffer = this.registerBuffer(
            new GLBuffer({
                clazz: Float32Array,
                gl: ctx,
                drawMode: this.ctx.STATIC_DRAW
            }).createBuffer(),
            [
                { name: "a_vertex_position",            size: 3 },
                { name: "a_vertex_angle",               size: 1 },
                { name: "a_bright_texture_position",    size: 2 },
                { name: "a_dark_texture_position",      size: 2 },
                { name: "a_mask_position",              size: 2 }
            ]
        ).glBuffer

        this.samplerUniform = this.getUniform("u_texture")
        this.textureSizeUniform = this.getUniform("u_texture_size")
        this.angleUniform = this.getUniform("u_angle")
        this.matrixUniform = this.getUniform("u_matrix")

        this.ctx.useProgram(this.raw)
        this.samplerUniform.set1i(0)
        this.textureSizeUniform.set2f(Sprite.mipmapimages[0].width, Sprite.mipmapimages[0].height)

        this.vertices = 0
    }

    private normalizeAngle(angle: number) {
        let normalizedAngle = (angle / Math.PI / 2) % 1
        if(normalizedAngle < 0) normalizedAngle += 1
        return normalizedAngle
    }

    setLightAngle(angle: number) {
        this.angleUniform.set1f(this.normalizeAngle(angle))
    }

    drawMaskedSprite(bright: Sprite, dark: Sprite, mask: Sprite, pos: Quadrangle, angle: number, z: number = 1) {
        const b = bright.rect;
        const d = dark.rect;
        const m = mask.rect;

        angle = this.normalizeAngle(angle)

        // vertex:
        // position, depth, angle, bright texture position, dark texture position, mask texture position

        this.vertexBuffer.appendArray([
            pos.x1, pos.y1, z, angle, b.x + b.w, b.y + b.h, d.x + d.w, d.y + m.h, m.x + m.w, m.y + m.h,
            pos.x2, pos.y2, z, angle, b.x + b.w, b.y,       d.x + d.w, d.y,       m.x + m.w, m.y,
            pos.x4, pos.y4, z, angle, b.x,       b.y,       d.x,       d.y,       m.x,       m.y,
            pos.x1, pos.y1, z, angle, b.x + b.w, b.y + b.h, d.x + d.w, d.y + m.h, m.x + m.w, m.y + m.h,
            pos.x3, pos.y3, z, angle, b.x,       b.y + b.h, d.x,       d.y + d.h, m.x,       m.y + m.h,
            pos.x4, pos.y4, z, angle, b.x,       b.y,       d.x,       d.y,       m.x,       m.y
        ])

        this.vertices += 6
    }

    reset() {
        this.vertexBuffer.reset()
        this.vertices = 0
    }

    bind() {
        super.bind()
        Sprite.setSmoothing(this.ctx, false)

        this.enableAttributes()
        this.setVertexAttributePointers()
    }

    draw() {
        if(this.vertexBuffer.pointer !== 0) {
            this.ctx.enable(this.ctx.DEPTH_TEST)
            this.ctx.disable(this.ctx.BLEND)

            this.vertexBuffer.sendDataToGPU()
            this.ctx.drawArrays(this.ctx.TRIANGLES, 0, this.vertices);
        }

        this.disableAttributes()

        Sprite.setSmoothing(this.ctx, true)
    }
}