/* @load-resource: '../../shaders/fragment/convex-shape-fragment.glsl' */
/* @load-resource: '../../shaders/vertex/convex-shape-vertex.glsl' */

import CameraProgram from "../camera-program";
import GLBuffer from "../../glbuffer";
import Shader from "../../shader";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/convex-shape-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/convex-shape-fragment.glsl"

export default class ConvexShapeProgram extends CameraProgram {

    public vertexBuffer: GLBuffer<Float32Array>;
    public colorBuffer: GLBuffer<Uint32Array>;
    public indexBuffer: GLBuffer<Uint16Array>
    private vertices: number;

    constructor(ctx: WebGLRenderingContext) {

        let vertexShader = new Shader(vertexShaderPath, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderPath, Shader.FRAGMENT).compile(ctx)
        super(vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx
        this.vertexBuffer = this.registerBuffer(
            new GLBuffer({
                gl: ctx,
                clazz: Float32Array,
                drawMode: this.ctx.STATIC_DRAW
            }).createBuffer(),
            [
                { name: "a_vertex_position", size: 2 }
            ]
        ).glBuffer

        this.colorBuffer = this.registerBuffer(
            new GLBuffer({
                gl: ctx,
                clazz: Uint32Array,
                glType: this.ctx.UNSIGNED_BYTE,
                drawMode: this.ctx.STATIC_DRAW
            }).createBuffer(),
        [
                { name: "a_color", size: 4, normalized: true }
            ]
        ).glBuffer

        this.indexBuffer = this.createIndexBuffer()

        this.matrixUniform = this.getUniform("u_matrix")
    }

    reset() {
        this.vertexBuffer.reset()
        this.indexBuffer.reset()
        this.colorBuffer.reset()

        this.vertices = 0
    }

    bind() {
        super.bind()

        this.enableAttributes()
        this.setVertexAttributePointers()
    }

    drawConvexShape(vertices: number[], color: number) {
        let points = vertices.length / 2
        for(let i = 0; i < points; i ++) this.colorBuffer.push(color)

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

    draw() {
        if(this.indexBuffer.pointer !== 0) {
            this.indexBuffer.sendDataToGPU()
            this.vertexBuffer.sendDataToGPU()
            this.colorBuffer.sendDataToGPU()

            this.ctx.disable(this.ctx.DEPTH_TEST)
            this.ctx.enable(this.ctx.BLEND)

            this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBuffer.glType, 0);
        }

        this.disableAttributes()
    }

    static getColor(r: number, g: number, b: number, a: number) {
        return ((a * 255) & 0xff) << 24 | (b & 0xff) << 16 | (g & 0xff) << 8 | (r & 0xff)
    }
}