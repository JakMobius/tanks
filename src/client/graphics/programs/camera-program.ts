import Uniform from "src/client/graphics/gl/uniform";
import VertexFragmentShaderProgram from "./vertex-fragment-shader-program";

export default abstract class CameraProgram extends VertexFragmentShaderProgram {
    static cameraMatrixUniformName = "u_matrix"
    public matrixUniform: Uniform;
    public camera: Float32Array

    protected constructor(vertexShaderSource: string, fragmentShaderSource: string, ctx: WebGLRenderingContext) {
        super(vertexShaderSource, fragmentShaderSource, ctx);

        this.matrixUniform = this.getUniform((this.constructor as typeof CameraProgram).cameraMatrixUniformName)
    }

    setCamera(camera: Float32Array) {
        this.camera = camera
    }

    bind() {
        super.bind();
        this.matrixUniform.setMatrix(this.camera)
    }
}