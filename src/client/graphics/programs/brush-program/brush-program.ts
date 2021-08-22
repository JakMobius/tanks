/* @load-resource: '../shaders/fragment/brush-fragment.glsl' */
/* @load-resource: '../shaders/vertex/brush-vertex.glsl' */

import GLBuffer from '../../glbuffer';
import GameMap from '../../../../map/gamemap';
import Uniform from "../../uniform";
import CameraProgram from "../camera-program";
import {Quadrangle} from "../../../../utils/quadrangle";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/brush-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/brush-fragment.glsl"

export default class BrushProgram extends CameraProgram {
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<Uint8Array>;
	public colorUniform: Uniform;
	public brushCenterUniform: Uniform;
	public brushDiameterUniform: Uniform;
	public brushSquareRadiusUniform: Uniform;
	public blockSizeUniform: Uniform;

    constructor(ctx: WebGLRenderingContext) {
        super(vertexShaderPath, fragmentShaderPath, ctx)

        this.vertexBuffer = this.createVertexArrayBuffer({
            clazz: Float32Array,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: 8,
            attributes: this.createVertexArrayAttributes([
                { name: "a_vertex_position", size: 2 }
            ])
        })

        this.indexBuffer = this.createIndexBuffer(Uint8Array, 8)
        this.indexBuffer.appendArray([0, 1, 3, 0, 2, 3])
        this.indexBuffer.bindAndSendDataToGPU()

        this.colorUniform = this.getUniform("u_color")
        this.brushCenterUniform = this.getUniform("u_brush_center")
        this.brushDiameterUniform = this.getUniform("u_brush_diameter")
        this.brushSquareRadiusUniform = this.getUniform("u_brush_square_radius")
        this.blockSizeUniform = this.getUniform("u_block_size")
    }

    setBlockSize(size: number) {
        this.blockSizeUniform.set1f(size)
    }

    setBrushColor(red: number, green: number, blue: number, alpha: number) {
        this.colorUniform.set4f(red, green, blue, alpha)
    }

    setBrushCenter(x: number, y: number) {
        this.brushCenterUniform.set2f(x, y)
    }

    setBrushDiameter(diameter: number) {
        let radius = diameter / 2
        let s = GameMap.BLOCK_SIZE
        this.brushDiameterUniform.set1i(diameter)
        this.brushSquareRadiusUniform.set1f(radius ** 2 * (s ** 2))
    }

    setBrushBounds(bounds: Quadrangle) {
        this.vertexBuffer.array[0] = bounds.x1
        this.vertexBuffer.array[1] = bounds.y1
        this.vertexBuffer.array[2] = bounds.x2
        this.vertexBuffer.array[3] = bounds.y2
        this.vertexBuffer.array[4] = bounds.x3
        this.vertexBuffer.array[5] = bounds.y3
        this.vertexBuffer.array[6] = bounds.x4
        this.vertexBuffer.array[7] = bounds.y4
    }

    draw() {
        this.ctx.disable(this.ctx.DEPTH_TEST)
        this.ctx.enable(this.ctx.BLEND)

        this.vertexBuffer.bindAndSendDataToGPU()
        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBuffer.glType, 0);
    }
}