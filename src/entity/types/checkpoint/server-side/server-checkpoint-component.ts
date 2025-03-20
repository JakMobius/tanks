
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import * as Box2D from "@box2d/core"
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import { PlayerRaceStateComponent } from "../../controller-race/server-side/player-race-state-component";

export default class ServerCheckpointComponent extends EventHandlerComponent {
    index: number

    constructor() {
        super()

        this.eventHandler.on("entity-hit", (hitEntity: Entity, contact: Box2D.b2Contact) => {
            let player = hitEntity.getComponent(ServerEntityPilotComponent)?.pilot
            if(!player) return

            let raceStateComponent = player.getComponent(PlayerRaceStateComponent)
            if(raceStateComponent.lastCheckpointIndex + 1 !== this.index) return

            raceStateComponent.passCheckpoint(this.entity)
        })
    }
}