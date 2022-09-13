import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import {TDMGameState} from "src/game-modes/tdm-game-state";
import TDMGameOverlay from "src/client/game/ui/overlay/game-overlay/tdm-game-overlay/tdm-game-overlay";

export class ClientTDMControllerComponent implements Component {
    entity: Entity | null;
    world: Entity | null

    eventHandler = new BasicEventHandlerSet()

    constructor() {
        this.eventHandler.on("attached-to-parent", (child, parent) => {
            if (child === this.entity) this.setWorld(parent)
        })

        this.eventHandler.on("detached-from-parent", (child, parent) => {
            if (child === this.entity) this.setWorld(null)
        })

        this.eventHandler.on("game-state-update", (state: TDMGameState) => {
            if(this.world) {
                this.world.emit("overlay-data", TDMGameOverlay, state)
            }
        })
    }

    setWorld(world: Entity | null) {
        this.world = world
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(null)
    }
}