/* @load-resource: '../../shaders/fragment/convex-shape-fragment.glsl' */
/* @load-resource: '../../shaders/vertex/convex-shape-vertex.glsl' */

import CameraProgram from "../camera-program";
import GLBuffer from "../../glbuffer";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/convex-shape-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/convex-shape-fragment.glsl"

export default class ConvexShapeProgram extends CameraProgram {

    public vertexBuffer: GLBuffer<Float32Array>
    public colorBuffer: GLBuffer<Uint32Array>
    public indexBuffer: GLBuffer<Uint16Array>
    private vertices: number;

    constructor(ctx: WebGLRenderingContext) {
        super(vertexShaderPath, fragmentShaderPath, ctx)

        this.vertexBuffer = this.createVertexArrayBuffer({
            clazz: Float32Array,
            drawMode: this.ctx.STATIC_DRAW,
            attributes: this.createVertexArrayAttributes([
                { name: "a_vertex_position", size: 2 }
            ])
        })

        this.colorBuffer = this.createVertexArrayBuffer({
            clazz: Uint32Array,
            glType: this.ctx.UNSIGNED_BYTE,
            drawMode: this.ctx.STATIC_DRAW,
            attributes: this.createVertexArrayAttributes([
                { name: "a_color", size: 4, normalized: true }
            ])
        })

        this.indexBuffer = this.createIndexBuffer(Uint16Array)
    }

    reset() {
        this.vertexBuffer.reset()
        this.indexBuffer.reset()
        this.colorBuffer.reset()

        this.vertices = 0
    }

    drawConvexShape(vertices: number[], color: number) {
        let points = vertices.length / 2
        for(let i = 0; i < points; i++) this.colorBuffer.push(color)

        const baseIndex = this.vertices
        this.vertexBuffer.appendArray(vertices)

        for(let i = 2; i < points; i++) {
            this.indexBuffer.push(baseIndex)
            this.indexBuffer.push(baseIndex + i - 1)
            this.indexBuffer.push(baseIndex + i)
        }

        this.vertices += points
    }

    drawRectangle(aX: number, aY: number, bX: number, bY: number, color: number) {
        this.drawConvexShape([
            aX, aY,
            aX, bY,
            bX, bY,
            bX, aY
        ], color)
    }

    shouldDraw(): boolean {
        return this.indexBuffer.pointer !== 0
    }

    draw() {
        this.indexBuffer.bindAndSendDataToGPU()
        this.vertexBuffer.bindAndSendDataToGPU()
        this.colorBuffer.bindAndSendDataToGPU()

        this.ctx.disable(this.ctx.DEPTH_TEST)
        this.ctx.enable(this.ctx.BLEND)

        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBuffer.glType, 0);
    }

    static getColor(r: number, g: number, b: number, a: number) {
        return ((a * 255) & 0xff) << 24 | (b & 0xff) << 16 | (g & 0xff) << 8 | (r & 0xff)
    }
}