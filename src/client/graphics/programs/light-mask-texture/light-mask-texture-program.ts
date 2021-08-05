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
	public brightTexturePositionAttribute: number;
	public darkTexturePositionAttribute: number;
	public maskPositionAttribute: number;
	public vertexPositionAttribute: number;
	public samplerUniform: Uniform;
	public textureSizeUniform: Uniform;
	public angleUniform: Uniform;
	public vertexLength: number;
    private vertexAngleAttribute: number;

    constructor(ctx: WebGLRenderingContext) {

        let vertexShader = new Shader(vertexShaderPath, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderPath, Shader.FRAGMENT).compile(ctx)
        super(vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx
        this.vertexBuffer = new GLBuffer({
            clazz: Float32Array,
            gl: ctx,
            drawMode: this.ctx.STATIC_DRAW
        }).createBuffer()

        this.brightTexturePositionAttribute = this.getAttribute("a_bright_texture_position");
        this.darkTexturePositionAttribute = this.getAttribute("a_dark_texture_position");
        this.maskPositionAttribute = this.getAttribute("a_mask_position");
        this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
        this.vertexAngleAttribute = this.getAttribute("a_vertex_angle")

        this.samplerUniform = this.getUniform("u_texture")
        this.textureSizeUniform = this.getUniform("u_texture_size")
        this.angleUniform = this.getUniform("u_angle")
        this.matrixUniform = this.getUniform("u_matrix")
        this.vertexLength = 9

        this.ctx.useProgram(this.raw)
        this.samplerUniform.set1i(0)
        this.textureSizeUniform.set2f(Sprite.mipmapimages[0].width, Sprite.mipmapimages[0].height)
    }

    private normalizeAngle(angle: number) {
        let normalizedAngle = (angle / Math.PI / 2) % 1
        if(normalizedAngle < 0) normalizedAngle += 1
        return normalizedAngle
    }

    setLightAngle(angle: number) {
        this.angleUniform.set1f(this.normalizeAngle(angle))
    }

    drawMaskedSprite(bright: Sprite, dark: Sprite, mask: Sprite, pos: Quadrangle, angle: number) {
        const b = bright.rect;
        const d = dark.rect;
        const m = mask.rect;

        angle = this.normalizeAngle(angle)

        // vertex:
        // position, angle, bright texture position, dark texture position, mask texture position

        this.vertexBuffer.appendArray([
            pos.x1, pos.y1, angle, b.x + b.w, b.y + b.h, d.x + d.w, d.y + m.h, m.x + m.w, m.y + m.h,
            pos.x2, pos.y2, angle, b.x + b.w, b.y,       d.x + d.w, d.y,       m.x + m.w, m.y,
            pos.x4, pos.y4, angle, b.x,       b.y,       d.x,       d.y,       m.x,       m.y,
            pos.x1, pos.y1, angle, b.x + b.w, b.y + b.h, d.x + d.w, d.y + m.h, m.x + m.w, m.y + m.h,
            pos.x3, pos.y3, angle, b.x,       b.y + b.h, d.x,       d.y + d.h, m.x,       m.y + m.h,
            pos.x4, pos.y4, angle, b.x,       b.y,       d.x,       d.y,       m.x,       m.y
        ])
    }

    reset() {
        this.vertexBuffer.reset()
    }

    bind() {
        super.bind()
        Sprite.setSmoothing(this.ctx, false)
        this.vertexBuffer.bind()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.enableVertexAttribArray(this.brightTexturePositionAttribute)
        this.ctx.enableVertexAttribArray(this.darkTexturePositionAttribute)
        this.ctx.enableVertexAttribArray(this.maskPositionAttribute)
        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute)
        this.ctx.enableVertexAttribArray(this.vertexAngleAttribute)

        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
        this.ctx.vertexAttribPointer(this.vertexAngleAttribute, 1, this.ctx.FLOAT, false, stride, 8)
        this.ctx.vertexAttribPointer(this.brightTexturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 12);
        this.ctx.vertexAttribPointer(this.darkTexturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 20);
        this.ctx.vertexAttribPointer(this.maskPositionAttribute, 2, this.ctx.FLOAT, false, stride, 28);
    }

    draw() {

        if(this.vertexBuffer.pointer !== 0) {
            this.vertexBuffer.updateData()
            this.ctx.drawArrays(this.ctx.TRIANGLES, 0, this.vertexBuffer.pointer / this.vertexLength);
        }

        this.ctx.disableVertexAttribArray(this.brightTexturePositionAttribute)
        this.ctx.disableVertexAttribArray(this.darkTexturePositionAttribute)
        this.ctx.disableVertexAttribArray(this.maskPositionAttribute)
        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute)
        this.ctx.disableVertexAttribArray(this.vertexAngleAttribute)

        Sprite.setSmoothing(this.ctx, true)
    }
}