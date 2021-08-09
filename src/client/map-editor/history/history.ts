import MapModification from "./modification/mapmodification";

class History {
	public history: any;
	public currentModifications: any;
	public historyIndex: any;

    constructor() {
        this.history = []
        this.currentModifications = []
        this.historyIndex = -1
    }

    commitActions(name: string) {
        this.history.push({
            modifications: this.currentModifications,
            actionName: name
        })
        this.currentModifications = []
        this.historyIndex++
    }

    registerModification(modification: MapModification) {
        if(this.historyIndex < this.history.length - 1)
            this.history = this.history.slice(0, this.historyIndex + 1)

        this.currentModifications.push(modification)
    }

    revertModifications(modifications: MapModification[]) {
        for(let i = modifications.length - 1; i >= 0; i--)
            modifications[i].revert()
    }

    performModifications(modifications: MapModification[]) {
        for(let modification of modifications) {
            modification.perform()
        }
    }

    goBack() {
        if(this.currentModifications.length) {
            return null
        } else if(this.history.length && this.historyIndex !== -1) {
            let index = this.historyIndex
            this.historyIndex--
            this.revertModifications(this.history[index].modifications)
            return this.history[index]
        }
        return null
    }

    goForward() {
        if(this.historyIndex >= this.history.length -1) return null;
        this.historyIndex++
        this.performModifications(this.history[this.historyIndex].modifications)
        return this.history[this.historyIndex]
    }
}

export default History;