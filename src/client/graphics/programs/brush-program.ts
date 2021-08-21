/* @load-resource: '../shaders/fragment/brush-fragment.glsl' */
/* @load-resource: '../shaders/vertex/brush-vertex.glsl' */

import Program from '../program';

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import GameMap from '../../../map/gamemap';
import Uniform from "../uniform";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/brush-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/brush-fragment.glsl"

export default class BrushProgram extends Program {
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<Uint16Array>;
	public matrixUniform: Uniform;
	public colorUniform: Uniform;
	public brushCenterUniform: Uniform;
	public brushDiameterUniform: Uniform;
	public brushSquareRadiusUniform: Uniform;
	public blockSizeUniform: Uniform;

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
                { name: "a_vertex_position", size: 2 }
            ]
        ).glBuffer

        this.vertexBuffer.extend(8)

        this.indexBuffer = this.createIndexBuffer()
        this.indexBuffer.appendArray([0, 1, 3, 0, 2, 3])
        this.indexBuffer.sendDataToGPU()

        this.matrixUniform = this.getUniform("u_matrix")
        this.colorUniform = this.getUniform("u_color")
        this.brushCenterUniform = this.getUniform("u_brush_center")
        this.brushDiameterUniform = this.getUniform("u_brush_diameter")
        this.brushSquareRadiusUniform = this.getUniform("u_brush_square_radius")
        this.blockSizeUniform = this.getUniform("u_block_size")
    }

    reset() {

    }

    bind() {
        super.bind()

        this.enableAttributes()
        this.setVertexAttributePointers()
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
    }

    draw() {

        this.ctx.disable(this.ctx.DEPTH_TEST)
        this.ctx.enable(this.ctx.BLEND)

        this.vertexBuffer.sendDataToGPU()
        this.ctx.drawElements(this.ctx.TRIANGLES, 6, this.ctx.UNSIGNED_SHORT, 0);

        this.disableAttributes()
    }
}