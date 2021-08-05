import ProgramController from "./program-controller";

export default abstract class ProgramFactory<ControllerClass extends ProgramController = ProgramController> {

    public ctx: WebGLRenderingContext

    protected constructor(ctx: WebGLRenderingContext) {
        this.ctx = ctx
    }

    abstract createController(): ControllerClass
}