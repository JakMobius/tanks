import Entity from "src/utils/ecs/entity";
import {DMGameState} from "src/entity/types/controller-dm/dm-game-state";
import { CTFGameStateHUD } from "src/client/ui/game-hud/ctf-game-hud/ctf-game-state-hud";
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
                this.world.emit("hud-view", CTFGameStateHUD, {
                    state: state,
                    world: this.world
                })
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