/* @load-resource: '../shaders/fragment/brush-fragment.glsl' */
/* @load-resource: '../shaders/vertex/brush-vertex.glsl' */

import Program from '../program';

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import GameMap from '../../../utils/map/gamemap';

class BrushProgram extends Program {
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: any;
	public vertexPositionAttribute: any;
	public matrixUniform: any;
	public colorUniform: any;
	public brushCenterUniform: any;
	public brushDiameterUniform: any;
	public brushSquareRadiusUniform: any;
	public blockSizeUniform: any;
	public vertexLength: any;
	public particles: any;

    constructor(name: string, ctx: WebGLRenderingContext) {
        let vertexShader = new Shader("src/client/graphics/shaders/vertex/brush-vertex.glsl", Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader("src/client/graphics/shaders/fragment/brush-fragment.glsl", Shader.FRAGMENT).compile(ctx)
        super(name, vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx
        this.vertexBuffer = new GLBuffer({
            clazz: Float32Array,
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

    setBrushDiameter(diameter: number) {
        let radius = diameter / 2
        let s = GameMap.BLOCK_SIZE
        this.brushDiameterUniform.set1i(diameter)
        this.brushSquareRadiusUniform.set1f(radius ** 2 * (s ** 2))
    }

    setBrushBounds(x1: number, y1: number, x2: number, y2: number) {
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

export default BrushProgram;