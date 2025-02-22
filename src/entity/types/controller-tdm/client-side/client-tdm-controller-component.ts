import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { TDMGameState } from "../tdm-game-state";
import { TDMGameStateHUD } from "src/client/ui/game-hud/tdm-game-hud/tdm-game-state-hud";

export class ClientTDMControllerComponent extends EventHandlerComponent {
    world: Entity | null

    constructor() {
        super()
        this.eventHandler.on("attached-to-parent", (parent) => {
            this.setWorld(parent)
        })

        this.eventHandler.on("detached-from-parent", () => {
            this.setWorld(null)
        })

        this.eventHandler.on("game-state-update", (state: TDMGameState) => {
            if(this.world) {
                this.world.emit("hud-view", TDMGameStateHUD, {
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