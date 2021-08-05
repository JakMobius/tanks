import Program from "../program";
import GLBuffer from "../glbuffer";
import Uniform from "../uniform";
import Shader from "../shader";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/particle-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/particle-fragment.glsl"

export default class LineProgram extends Program {
    public vertexBuffer: GLBuffer<Float32Array>;
    public colorBuffer: GLBuffer<Uint32Array>;
    public indexBuffer: GLBuffer<Uint16Array>
    public vertexPositionAttribute: number;
    public colorAttribute: number;
    public matrixUniform: Uniform;
    public vertexLength: number;
    private verticesCount: number;

    constructor(name: string, ctx: WebGLRenderingContext) {

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

        this.colorBuffer = new GLBuffer<Uint32Array>({
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
        this.colorBuffer.reset()
        this.indexBuffer.reset()
        this.verticesCount = 0
    }

    bind() {
        super.bind()
        this.vertexBuffer.bind()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);

        this.colorBuffer.bind()

        const colorBytes = this.colorBuffer.clazz.BYTES_PER_ELEMENT

        this.ctx.enableVertexAttribArray(this.colorAttribute);
        this.ctx.vertexAttribPointer(this.colorAttribute, 4, this.ctx.UNSIGNED_BYTE, true, colorBytes, 0);
    }

    strokeShape(vertices: number[], color: number, close: boolean = false) {
        if(close) {
            vertices.push(vertices[0])
            vertices.push(vertices[1])
        }
        let baseIndex = this.verticesCount

        let points = vertices.length / 2
        for(let i = 0; i < points; i++) this.colorBuffer.push(color)
        this.vertexBuffer.appendArray(vertices)

        for(let i = 1; i < points; i++) {
            this.indexBuffer.push(baseIndex + i - 1)
            this.indexBuffer.push(baseIndex + i)
        }

        this.verticesCount += points
    }

    draw() {
        //this.ctx.blendFunc(this.ctx.ONE, this.ctx.ONE_MINUS_SRC_COLOR)

        this.indexBuffer.updateData()
        this.vertexBuffer.updateData()
        this.colorBuffer.updateData()

        if(this.indexBuffer.pointer !== 0) {
            this.ctx.drawElements(this.ctx.LINES, this.indexBuffer.pointer, this.ctx.UNSIGNED_SHORT, 0);
        }

        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.disableVertexAttribArray(this.colorAttribute);

        //this.ctx.blendFuncSeparate(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA, this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA);
    }
}