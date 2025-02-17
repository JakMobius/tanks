import Entity from "src/utils/ecs/entity";
import {DMGameState} from "src/entity/types/controller-dm/dm-game-state";
import CTFGameStateOverlay from "src/client/ui/overlay/game-overlay/ctf-game-overlay/ctf-game-state-overlay";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export class ClientCTFControllerComponent extends EventHandlerComponent {
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
                this.world.emit("overlay-data", CTFGameStateOverlay, state)
            }
        })

        this.eventHandler.on("game-event", (state: DMGameState) => {
            // TODO
        })
    }

    setWorld(world: Entity | null) {
        this.world = world
    }
}