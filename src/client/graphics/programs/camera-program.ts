import Program from "../program";
import Uniform from "../uniform";
import Camera from "../../camera";

export default abstract class CameraProgram extends Program {
    public matrixUniform: Uniform;

    setCamera(camera: Camera) {
        this.matrixUniform.setMatrix(camera.matrix.m)
    }
}