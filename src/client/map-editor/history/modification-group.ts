import { Modification } from "./history-manager";

export default class ModificationGroup implements Modification {
    modifications: Modification[] = []
    actionName: string

    constructor(actionName: string) {
        this.actionName = actionName
    }

    add(modification: Modification) {
        this.modifications.push(modification)
    }

    perform() {
        for(let modification of this.modifications) {
            modification.perform()
        }
    }

    revert() {
        for(let i = this.modifications.length - 1; i >= 0; i--) {
            this.modifications[i].revert()
        }
    }
}