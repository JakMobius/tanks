import ProgramController from "./program-controller";
import CameraProgram from "../camera-program";
import Camera from "../../../camera";

export default class BasicCameraProgramController<ProgramClass extends CameraProgram = CameraProgram> extends ProgramController<ProgramClass> {

    public camera: Camera

    constructor(program: ProgramClass, camera: Camera) {
        super(program)
        this.camera = camera
    }

    reset() {
        this.program.reset()
    }

    protected didBind() {
        this.program.setCamera(this.camera)
    }

    draw() {
        if(this.program.shouldDraw()) {
            this.program.bind()
            this.didBind()
            this.program.draw()
            this.program.clean()
        }
    }
}