import ProgramController from "./program-controller";
import CameraProgram from "../camera-program";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "src/entity/components/transform/transform-component";
import { Matrix3 } from "src/utils/matrix3";

export default class BasicCameraProgramController<ProgramClass extends CameraProgram = CameraProgram> extends ProgramController<ProgramClass> {

    public camera: Entity

    constructor(program: ProgramClass, camera: Entity) {
        super(program)
        this.camera = camera
    }

    reset() {
        this.program.reset()
        let matrix = this.camera.getComponent(TransformComponent).getInvertedGlobalTransform()

        // Dirty hack: to avoid copying the matrix to new Float32Array
        // it's casted from ReadonlyMatrix3 to Matrix3. TODO: figure out how to avoid this
        this.program.setCamera((matrix as Matrix3).getArray())
    }

    draw() {
        if(this.program.shouldDraw()) {
            this.program.bind()
            this.program.draw()
            this.program.clean()
        }
    }
}