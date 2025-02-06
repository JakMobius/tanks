import Program from "./program";
import Shader from "src/client/graphics/shaders/shader";

export default abstract class VertexFragmentShaderProgram extends Program {

    ctx: WebGLRenderingContext

    protected constructor(vertexShaderSource: string, fragmentShaderSource: string, ctx: WebGLRenderingContext) {
        let vertexShader = new Shader(vertexShaderSource, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderSource, Shader.FRAGMENT).compile(ctx)

        super(vertexShader, fragmentShader);

        this.link(ctx)
        this.ctx = ctx
    }
}