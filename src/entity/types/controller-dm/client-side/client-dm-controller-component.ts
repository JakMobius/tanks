import Entity from "src/utils/ecs/entity";
import {DMGameState} from "src/entity/types/controller-dm/dm-game-state";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { DMGameStateHUD } from "src/client/ui/game-hud/dm-game-hud/dm-game-state-hud";

export class ClientDMControllerComponent extends EventHandlerComponent {
    world: Entity | null

    constructor() {
        super()
        this.eventHandler.on("attached-to-parent", (parent) => {
            this.setWorld(parent)
        })

        this.eventHandler.on("detached-from-parent", () => {
            this.setWorld(null)
        })

        this.eventHandler.on("game-state-update", (state: DMGameState) => {
            if(this.world) {
                this.world.emit("hud-view", DMGameStateHUD, {
                    state: state,
                    world: this.world
                })
            }
        })
    }

    setWorld(world: Entity | null) {
        this.world = world
    }
}