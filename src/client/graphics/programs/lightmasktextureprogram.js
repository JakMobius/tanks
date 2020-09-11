/* @load-resource: '../shaders/fragment/light-mask-texture-fragment.glsl' */
/* @load-resource: '../shaders/vertex/light-mask-texture-vertex.glsl' */

const Program = require("../program")
const Shader = require("../shader")
const GLBuffer = require("../glbuffer")
const Sprite = require("../../sprite")

class LightMaskTextureProgram extends Program {
    constructor(name, ctx) {

        let vertexShader = new Shader("light-mask-texture-vertex", Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader("light-mask-texture-fragment", Shader.FRAGMENT).compile(ctx)
        super(name, vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx
        this.vertexBuffer = new GLBuffer({
            gl: ctx,
            drawMode: this.ctx.STATIC_DRAW
        }).createBuffer()

        this.brightTexturePositionAttribute = this.getAttribute("a_bright_texture_position");
        this.darkTexturePositionAttribute = this.getAttribute("a_dark_texture_position");
        this.maskPositionAttrubute = this.getAttribute("a_mask_position");
        this.vertexPositionAttribute = this.getAttribute("a_vertex_position");

        this.samplerUniform = this.getUniform("u_texture")
        this.textureSizeUniform = this.getUniform("u_texture_size")
        this.angleUniform = this.getUniform("u_angle")
        this.matrixUniform = this.getUniform("u_matrix")
        this.vertexLength = 8

        this.use()
        this.samplerUniform.set1i(0)
        this.textureSizeUniform.set2f(Sprite.mipmapimages[0].width, Sprite.mipmapimages[0].height)
    }

    setLightAngle(angle) {
        let normalizedAngle = (angle / Math.PI / 2) % 1
        if(normalizedAngle < 0) normalizedAngle += 1

        this.angleUniform.set1f(normalizedAngle)
    }

    drawMaskedSprite(bright, dark, mask, x, y, width, height) {
        const a = bright.rect;
        const b = dark.rect;
        const c = mask.rect;

        this.vertexBuffer.appendArray([
            x + width, y + height, a.x + a.w, a.y + a.h, b.x + b.w, b.y + c.h, c.x + c.w, c.y + c.h,
            x + width, y, a.x + a.w, a.y, b.x + b.w, b.y, c.x + c.w, c.y,
            x, y, a.x, a.y, b.x, b.y, c.x, c.y,
            x + width, y + height, a.x + a.w, a.y + a.h, b.x + b.w, b.y + c.h, c.x + c.w, c.y + c.h,
            x, y + height, a.x, a.y + a.h, b.x, b.y + b.h, c.x, c.y + c.h,
            x, y, a.x, a.y, b.x, b.y, c.x, c.y
        ])
    }

    prepare() {
        Sprite.setSmoothing(this.ctx, false)
        this.vertexBuffer.bind()
        this.vertexBuffer.reset()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.enableVertexAttribArray(this.brightTexturePositionAttribute)
        this.ctx.enableVertexAttribArray(this.darkTexturePositionAttribute)
        this.ctx.enableVertexAttribArray(this.maskPositionAttrubute)
        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute)

        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
        this.ctx.vertexAttribPointer(this.brightTexturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 8);
        this.ctx.vertexAttribPointer(this.darkTexturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 16);
        this.ctx.vertexAttribPointer(this.maskPositionAttrubute, 2, this.ctx.FLOAT, false, stride, 24);
    }

    draw() {
        this.vertexBuffer.updateData()
        this.ctx.drawArrays(this.ctx.TRIANGLES, 0, this.vertexBuffer.pointer / this.vertexLength);

        this.ctx.disableVertexAttribArray(this.brightTexturePositionAttribute)
        this.ctx.disableVertexAttribArray(this.darkTexturePositionAttribute)
        this.ctx.disableVertexAttribArray(this.maskPositionAttrubute)
        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute)

        Sprite.setSmoothing(this.ctx, true)
    }
}

module.exports = LightMaskTextureProgram