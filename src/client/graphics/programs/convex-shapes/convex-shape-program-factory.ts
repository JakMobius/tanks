import ProgramFactory from "../controllers/program-factory";
import BasicCameraProgramController from "../controllers/basic-camera-program-controller";
import Camera from "../../../camera";
import ConvexShapeProgram from "./convex-shape-program";

export default class ConvexShapeProgramFactory extends ProgramFactory<BasicCameraProgramController> {

    public camera: Camera

    constructor(ctx: WebGLRenderingContext, camera: Camera) {
        super(ctx)
        this.camera = camera
    }

    createController(): BasicCameraProgramController {
        const program = new ConvexShapeProgram(this.ctx)
        return new BasicCameraProgramController(program, this.camera)
    }

}