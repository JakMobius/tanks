import ProgramController from "./program-controller";
import CameraProgram from "../camera-program";
import Entity from "src/utils/ecs/entity";

export default class BasicCameraProgramController<ProgramClass extends CameraProgram = CameraProgram> extends ProgramController<ProgramClass> {

    public camera: Entity

    constructor(program: ProgramClass, camera: Entity) {
        super(program)
        this.camera = camera
    }

    reset() {
        this.program.reset()
        this.program.setCamera(this.camera)
    }

    draw() {
        if(this.program.shouldDraw()) {
            this.program.bind()
            this.program.draw()
            this.program.clean()
        }
    }
}