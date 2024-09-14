import {Constructor} from "src/utils/constructor";
import Program from "src/client/graphics/programs/program";
import ProgramController from "src/client/graphics/programs/controllers/program-controller";

export default class ProgramPool {
    programControllerFactories = new Map<Constructor<Program>, () => ProgramController>()
    controllers = new Map<Constructor<Program>, ProgramController>()

    getController(programClass: Constructor<Program>): ProgramController {
        let controller = this.controllers.get(programClass)
        if(!controller) {
            let factory = this.programControllerFactories.get(programClass)
            if(!factory) throw new Error(`No factory registered for program ${programClass.name}`)
            controller = factory()
            this.controllers.set(programClass, controller)
        }
        return controller
    }

    registerFactory(programClass: Constructor<Program>, factory: () => ProgramController) {
        this.programControllerFactories.set(programClass, factory)
    }
}