import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import EventEmitter from "../../../utils/event-emitter";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import PlayerRespawnEvent from "../../../events/player-respawn-event";
import PhysicalComponent from "../../../entity/components/physics-component";

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