
import ProgramController from "../programs/controllers/program-controller";
import {Constructor} from "../../../serialization/binary/serializable";
import Program from "../program";

export default class DrawPhase {
    private controllers = new Map<Constructor<Program>, ProgramController>()

    getProgram<T extends Program>(programType: Constructor<T>): T {
        let controller = this.controllers.get(programType)
        if(!controller) {
            throw new Error("Could not handle getProgram request: controller for program with type '" + programType.name + "' has not been registered")
        }
        return (controller as any as ProgramController<T>).program
    }

    register(controller: ProgramController) {
        this.controllers.set(controller.program.constructor as Constructor<Program>, controller)
    }

    prepare() {
        for(let controller of this.controllers.values()) controller.reset()
    }

    draw() {
        for(let controller of this.controllers.values()) controller.draw()
    }
}