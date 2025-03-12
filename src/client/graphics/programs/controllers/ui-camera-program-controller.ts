import ProgramController from "./program-controller";
import CameraProgram from "../camera-program";
import Entity from "src/utils/ecs/entity";
import { Matrix3 } from "src/utils/matrix3";
import CameraComponent from "../../camera";

export default class UICameraProgramController<ProgramClass extends CameraProgram = CameraProgram> extends ProgramController<ProgramClass> {

    public camera: Entity
    public matrix = new Matrix3()

    constructor(program: ProgramClass, camera: Entity) {
        super(program)
        this.camera = camera
    }

    reset() {
        this.program.reset()
        let viewport = this.camera.getComponent(CameraComponent).viewport

        this.matrix.reset()
        this.matrix.scale(1 / viewport.x, 1 / viewport.y)

        // Dirty hack: to avoid copying the matrix to new Float32Array
        // it's casted from ReadonlyMatrix3 to Matrix3. TODO: figure out how to avoid this
        this.program.setCamera(this.matrix.getArray())
    }

    draw() {
        if(this.program.shouldDraw()) {
            this.program.bind()
            this.program.draw()
            this.program.clean()
        }
    }
}