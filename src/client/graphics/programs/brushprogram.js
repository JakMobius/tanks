/* @load-resource: '../shaders/fragment/brush-fragment.glsl' */
/* @load-resource: '../shaders/vertex/brush-vertex.glsl' */

const Program = require("../program")
const Shader = require("../shader")
const GLBuffer = require("../glbuffer")
const GameMap = require("../../../utils/map/gamemap")

class BrushProgram extends Program {
    constructor(name, ctx) {
        let vertexShader = new Shader("brush-vertex", Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader("brush-fragment", Shader.FRAGMENT).compile(ctx)
        super(name, vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx
        this.vertexBuffer = new GLBuffer({
            gl: ctx,
            drawMode: this.ctx.STATIC_DRAW
        }).createBuffer()
        this.vertexBuffer.extend(8)

        this.indexBuffer = this.createIndexBuffer()
        this.indexBuffer.appendArray([0, 1, 3, 0, 2, 3])
        this.indexBuffer.updateData()

        this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
        this.matrixUniform = this.getUniform("u_matrix")
        this.colorUniform = this.getUniform("u_color")
        this.brushCenterUniform = this.getUniform("u_brush_center")
        this.brushDiameterUniform = this.getUniform("u_brush_diameter")
        this.brushSquareRadiusUniform = this.getUniform("u_brush_square_radius")
        this.blockSizeUniform = this.getUniform("u_block_size")
        this.vertexLength = 2
        this.particles = 0
    }

    prepare() {
        this.vertexBuffer.bind()
        this.indexBuffer.bind()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute)
        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
    }

    setBrushDiameter(diameter) {
        let radius = diameter / 2
        let s = GameMap.BLOCK_SIZE
        this.brushDiameterUniform.set1i(diameter)
        this.brushSquareRadiusUniform.set1f(radius ** 2 * s ** 2)
    }

    setBrushBounds(x1, y1, x2, y2) {
        this.vertexBuffer.array[0] = x1
        this.vertexBuffer.array[1] = y1
        this.vertexBuffer.array[2] = x2
        this.vertexBuffer.array[3] = y1
        this.vertexBuffer.array[4] = x1
        this.vertexBuffer.array[5] = y2
        this.vertexBuffer.array[6] = x2
        this.vertexBuffer.array[7] = y2
        this.vertexBuffer.updateData()
    }

    draw() {
        this.vertexBuffer.updateData()
        this.ctx.drawElements(this.ctx.TRIANGLES, 6, this.ctx.UNSIGNED_SHORT, 0);

        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute)
    }
}

module.exports = BrushProgram