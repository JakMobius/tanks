import Uniform from "../uniform";
import Camera from "src/client/camera";
import VertexFragmentShaderProgram from "./vertex-fragment-shader-program";

export default abstract class CameraProgram extends VertexFragmentShaderProgram {
    static cameraMatrixUniformName = "u_matrix"

    public matrixUniform: Uniform;

    protected constructor(vertexShaderPath: string, fragmentShaderPath: string, ctx: WebGLRenderingContext) {
        super(vertexShaderPath, fragmentShaderPath, ctx);

        this.matrixUniform = this.getUniform((this.constructor as typeof CameraProgram).cameraMatrixUniformName)
    }

    setCamera(camera: Camera) {
        this.matrixUniform.setMatrix(camera.matrix.m)
    }
}