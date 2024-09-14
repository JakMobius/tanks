import Entity from "src/utils/ecs/entity";
import {TDMGameState} from "src/entity/types/controller-tdm/tdm-game-state";
import TDMGameStateOverlay from "src/client/ui/overlay/game-overlay/tdm-game-overlay/tdm-game-state-overlay";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export class ClientTDMControllerComponent extends EventHandlerComponent {
    world: Entity | null

    constructor() {
        super()
        this.eventHandler.on("attached-to-parent", (parent) => {
            this.setWorld(parent)
        })

        this.eventHandler.on("detached-from-parent", (parent) => {
            this.setWorld(null)
        })

        this.eventHandler.on("game-state-update", (state: TDMGameState) => {
            if(this.world) {
                this.world.emit("overlay-data", TDMGameStateOverlay, state)
            }
        })
    }

    setWorld(world: Entity | null) {
        this.world = world
    }
}