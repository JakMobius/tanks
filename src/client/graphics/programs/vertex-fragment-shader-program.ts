import Program from "./program";
import Shader from "../shader";

export default abstract class VertexFragmentShaderProgram extends Program {

    ctx: WebGLRenderingContext

    protected constructor(vertexShaderPath: string, fragmentShaderPath: string, ctx: WebGLRenderingContext) {
        let vertexShader = new Shader(vertexShaderPath, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderPath, Shader.FRAGMENT).compile(ctx)

        super(vertexShader, fragmentShader);

        this.link(ctx)
        this.ctx = ctx
    }
}