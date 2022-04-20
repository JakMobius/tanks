import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import Entity from "../utils/ecs/entity";
import ServerGameWorld from "./server-game-world";
import {PlayerConfig} from "../abstract-player";
import ServerTank from "./entity/tank/server-tank";
import EntityDataTransmitComponent from "../entity/components/network/entity-data-transmit-component";
import EffectTransmitter from "../entity/components/network/effect/effect-transmitter";
import MapTransmitter from "../entity/components/network/map/map-transmitter";
import TransformComponent from "../entity/components/transform-component";
import PhysicalComponent from "../entity/components/physics-component";
import PositionTransmitterComponent from "../entity/components/network/position/position-transmitter-component";
import HealthTransmitterComponent from "../entity/components/network/health/health-transmitter-component";
import SocketPortalClient from "./socket/socket-portal-client";

export default class PlayerVisibilityManager {
    // There are times when you can't rewrite something well,
    // because that something depends on something else, which
    // depends on what you want to rewrite. In such cases,
    // temporary patches are the only way to save the situation.
    // Please, future me, rewrite this code. It should not be
    // present in that beautiful code I have ahead of me.

    // TODO: This stuff should be replaced entirely

    tankEventHandler = new BasicEventHandlerSet()
    visibleEntities = new Set<Entity>()
    client: SocketPortalClient

    private world: ServerGameWorld
    private tank: ServerTank

    constructor() {
        this.tankEventHandler.on("tick", () => this.updateVisibleEntities())
    }

    setWorld(world: ServerGameWorld) {
        if(this.world) {
            let transmitComponent = this.world.getComponent(EntityDataTransmitComponent)
            transmitComponent.detachTransmitters(this)
        }

        this.world = world

        if(this.world) {
            let transmitComponent = this.world.getComponent(EntityDataTransmitComponent)
            transmitComponent.attachTransmitter(this, new EffectTransmitter())
            transmitComponent.attachTransmitter(this, new MapTransmitter())
        }
    }

    setTank(tank: ServerTank) {
        this.tank = tank
        this.tankEventHandler.setTarget(tank.model)
    }

    private updateVisibleEntities() {
        // This code is bad on purpose. I'm forcing myself to
        // rewrite this in the future.

        for(let entity of this.tank.model.parent.children) {
            let transform = entity.getComponent(TransformComponent)
            if(!transform) continue

            let position = transform.getPosition()
            let myPosition = this.tank.model.getComponent(PhysicalComponent).getBody().GetPosition()

            position.x -= myPosition.x
            position.y -= myPosition.y

            let length = Math.sqrt(position.x * position.x + position.y * position.y)

            let visible = length < 20

            if(visible == this.visibleEntities.has(entity)) continue;

            let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
            if(!transmitComponent) continue

            if(visible) {
                transmitComponent.attachTransmitter(this, new EffectTransmitter())
                transmitComponent.attachTransmitter(this, new PositionTransmitterComponent())
                transmitComponent.attachTransmitter(this, new HealthTransmitterComponent())
                this.visibleEntities.add(entity)
            } else {
                transmitComponent.detachTransmitters(this)
                this.visibleEntities.delete(entity)
            }
        }
    }
}