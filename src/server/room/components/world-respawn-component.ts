import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import EventEmitter from "src/utils/event-emitter";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import PhysicalComponent from "src/entity/components/physics-component";

export default class WorldRespawnComponent implements Component {

    entity: Entity | null = null
    eventHandler = new BasicEventHandlerSet()

    constructor() {
        this.eventHandler.on("player-respawn", (event) => this.onPlayerRespawn(event), EventEmitter.PRIORITY_MONITOR)
    }

    onPlayerRespawn(event: PlayerRespawnEvent) {
        if(event.cancelled) return
        if(!event.player.tank) return

        const body = event.player.tank.getComponent(PhysicalComponent)
        body.setPosition(event.respawnPosition)
        body.setAngle(event.respawnAngle)
        body.setVelocity({x: 0, y: 0})
        body.setAngularVelocity(0)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(null)
    }
}