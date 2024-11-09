import Entity from "src/utils/ecs/entity";
import {DMGameState} from "src/entity/types/controller-dm/dm-game-state";
import DMGameStateOverlay from "src/client/ui/overlay/game-overlay/dm-game-overlay/dm-game-state-overlay";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export class ClientDMControllerComponent extends EventHandlerComponent {
    world: Entity | null

    constructor() {
        super()
        this.eventHandler.on("attached-to-parent", (parent) => {
            this.setWorld(parent)
        })

        this.eventHandler.on("detached-from-parent", (parent) => {
            this.setWorld(null)
        })

        this.eventHandler.on("game-state-update", (state: DMGameState) => {
            if(this.world) {
                this.world.emit("overlay-data", DMGameStateOverlay, state)
            }
        })
    }

    setWorld(world: Entity | null) {
        this.world = world
    }
}