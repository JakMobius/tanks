import MapModification from "./modification/map-modification";
import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import BlockState from "../../../map/block-state/block-state";
import MapBlockModification from "./modification/map-block-modification";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import GameMap from "../../../map/game-map";

export interface GameMapModification {
    modifications: MapModification[]
    actionName: string
}

export default class GameMapHistoryComponent implements Component {
    entity: Entity | null
    preventNativeModificationRegistering: boolean = false

	public history: GameMapModification[];
	public currentModifications: MapModification[];
	public historyIndex: number;

    private eventHandler = new BasicEventHandlerSet()

    constructor() {
        this.history = []
        this.currentModifications = []
        this.historyIndex = -1

        this.eventHandler.on("block-will-change", (x, y, block) => this.onBlockSet(x, y, block))
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

    onBlockSet(x: number, y: number, block: BlockState) {
        if(!this.preventNativeModificationRegistering) {
            this.registerModification(
                new MapBlockModification(this.entity as GameMap, x, y, block)
            )
        }
    }

    onAttach(entity: Entity) {
        this.entity = entity
        this.eventHandler.setTarget(entity)
    }

    onDetach() {
        this.entity = null
        this.eventHandler.setTarget(null)
    }
}