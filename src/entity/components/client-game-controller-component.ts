import Entity from "src/utils/ecs/entity";
import {DMGameState} from "src/entity/types/controller-dm/dm-game-state";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { GameHudListenerComponent } from "src/client/ui/game-hud/game-hud";
import { WorldComponent } from "src/entity/game-world-entity-prefab";

interface GameHudPropsBase {
    world: Entity,
    state: any,
    event: any
}

export class ClientGameControllerComponent extends EventHandlerComponent {
    world: Entity | null = null
    state: DMGameState | null = null
    hudFC: React.FC<GameHudPropsBase>

    constructor(hudFC: React.FC<GameHudPropsBase>) {
        super()

        this.hudFC = hudFC

        this.eventHandler.on("hud-attach", (hud: GameHudListenerComponent) => {
            hud.addListener(this.entity, "hud-view")
        })

        this.eventHandler.on("hud-detach", (hud: GameHudListenerComponent) => {
            hud.removeListener(this.entity, "hud-view")
        })

        this.eventHandler.on("game-event", (event: any) => {
            this.entity.emit("hud-view", this.hudFC, {
                event: event,
                world: this.world
            })
        })

        this.eventHandler.on("game-state-update", (state: any) => {
            this.state = state
            this.updateHud()
        })
    }

    updateHud() {
        this.entity.emit("hud-view", this.hudFC, {
            state: this.state,
            world: WorldComponent.getWorld(this.entity)
        })
    }
}