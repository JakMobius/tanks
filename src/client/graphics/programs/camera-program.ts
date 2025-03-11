import Uniform from "src/client/graphics/gl/uniform";
import VertexFragmentShaderProgram from "./vertex-fragment-shader-program";
import TransformComponent from "src/entity/components/transform/transform-component";
import Entity from "src/utils/ecs/entity";
import { Matrix3 } from "src/utils/matrix3";

export default abstract class CameraProgram extends VertexFragmentShaderProgram {
    static cameraMatrixUniformName = "u_matrix"
    public matrixUniform: Uniform;
    public camera: Entity

    protected constructor(vertexShaderSource: string, fragmentShaderSource: string, ctx: WebGLRenderingContext) {
        super(vertexShaderSource, fragmentShaderSource, ctx);

        this.matrixUniform = this.getUniform((this.constructor as typeof CameraProgram).cameraMatrixUniformName)
    }

    setCamera(camera: Entity) {
        this.camera = camera
    }

    bind() {
        super.bind();
        let matrix = this.camera.getComponent(TransformComponent).getInvertedGlobalTransform()

        // Dirty hack: to avoid copying the matrix to new Float32Array
        // it's casted from ReadonlyMatrix3 to Matrix3. TODO: figure out how to avoid this

        this.matrixUniform.setMatrix((matrix as Matrix3).getArray())
    }
}