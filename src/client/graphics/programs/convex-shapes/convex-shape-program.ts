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
    public vertexPositionAttribute: number;
    public colorAttribute: number;
    public vertexLength: number;
    private verticesCount: number;

    constructor(ctx: WebGLRenderingContext) {

        let vertexShader = new Shader(vertexShaderPath, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderPath, Shader.FRAGMENT).compile(ctx)
        super(vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx
        this.vertexBuffer = new GLBuffer({
            gl: ctx,
            clazz: Float32Array,
            drawMode: this.ctx.STATIC_DRAW
        }).createBuffer()

        this.colorBuffer = new GLBuffer({
            gl: ctx,
            clazz: Uint32Array,
            drawMode: this.ctx.STATIC_DRAW
        }).createBuffer()

        this.indexBuffer = this.createIndexBuffer()

        this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
        this.colorAttribute = this.getAttribute("a_color");
        this.matrixUniform = this.getUniform("u_matrix")
        this.vertexLength = 2
    }

    reset() {
        this.vertexBuffer.reset()
        this.indexBuffer.reset()
        this.colorBuffer.reset()
    }

    bind() {
        super.bind()

        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.enableVertexAttribArray(this.colorAttribute);

        this.vertexBuffer.bind()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);

        this.colorBuffer.bind()

        const colorBytes = this.colorBuffer.clazz.BYTES_PER_ELEMENT

        this.ctx.vertexAttribPointer(this.colorAttribute, 4, this.ctx.UNSIGNED_BYTE, true, colorBytes, 0);

        this.verticesCount = 0
    }

    drawConvexShape(vertices: number[], color: number) {
        let points = vertices.length / 2
        for(let i = 0; i < points; i ++) this.colorBuffer.push(color)

        const baseIndex = this.verticesCount
        this.vertexBuffer.appendArray(vertices)

        for(let i = 2; i < points; i++) {
            this.indexBuffer.push(baseIndex)
            this.indexBuffer.push(baseIndex + i - 1)
            this.indexBuffer.push(baseIndex + i)
        }

        this.verticesCount += points
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
        //this.ctx.blendFunc(this.ctx.ONE, this.ctx.ONE_MINUS_SRC_COLOR)

        if(this.indexBuffer.pointer !== 0) {
            this.indexBuffer.updateData()
            this.vertexBuffer.updateData()
            this.colorBuffer.updateData()

            this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_SHORT, 0);
        }

        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.disableVertexAttribArray(this.colorAttribute);

        //this.ctx.blendFuncSeparate(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA, this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA);
    }

    static getColor(r: number, g: number, b: number, a: number) {
        return ((a * 255) & 0xff) << 24 | (b & 0xff) << 16 | (g & 0xff) << 8 | (r & 0xff)
    }
}