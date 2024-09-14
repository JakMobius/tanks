import ProgramController from "../programs/controllers/program-controller";
import {Constructor} from "src/utils/constructor"
import Program from "../programs/program";
import ProgramPool from "src/client/graphics/program-pool";
import EntityDrawer from "src/client/graphics/drawers/entity-drawer";
import EventEmitter from "src/utils/event-emitter";

export default class DrawPhase extends EventEmitter {
    private programPool: ProgramPool
    private controllers = new Map<Constructor<Program>, ProgramController>()

    constructor(programPool: ProgramPool) {
        super()
        this.programPool = programPool
    }

    getProgram<T extends Program>(programType: Constructor<T>): T {
        let controller = this.controllers.get(programType)
        if (!controller) {
            controller = this.programPool.getController(programType)
            controller.reset()
            this.controllers.set(programType, controller)
        }
        return (controller as any as ProgramController<T>).program
    }

    register(controller: ProgramController) {
        this.controllers.set(controller.program.constructor as Constructor<Program>, controller)
    }

    prepare() {
        this.controllers.clear()
    }

    runPrograms() {
        for (let controller of this.controllers.values()) controller.draw()
    }

    draw() {
        this.prepare()

        this.emit("draw", this)

        this.runPrograms()
    }
}