import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import Entity from "../utils/ecs/entity";
import ServerGameWorld from "./server-game-world";
import EntityDataTransmitComponent from "../entity/components/network/transmitting/entity-data-transmit-component";
import EffectTransmitter from "../entity/components/network/effect/effect-transmitter";
import MapTransmitter from "../entity/components/network/map/map-transmitter";
import TransformComponent from "../entity/components/transform-component";
import PhysicalComponent from "../entity/components/physics-component";
import PositionTransmitter from "../entity/components/network/position/position-transmitter";
import HealthTransmitter from "../entity/components/network/health/health-transmitter";
import SocketPortalClient from "./socket/socket-portal-client";
import {ReceivingEnd} from "../entity/components/network/transmitting/receiving-end";
import EntityStateTransmitter from "../entity/components/network/entity/entity-state-transmitter";
import PrimaryPlayerTransmitter from "../entity/components/network/primary-player/primary-player-transmitter";
import EntityModel from "../entity/entity-model";

export default class PlayerVisibilityManager {
    // There are times when you can't rewrite something well,
    // because that something depends on something else, which
    // depends on what you want to rewrite. In such cases,
    // temporary patches are the only way to save the situation.
    // Please, future me, rewrite this code. It should not be
    // present in that beautiful game I have ahead of me.

    // TODO: This stuff should be replaced entirely

    tankEventHandler = new BasicEventHandlerSet()
    visibleEntities = new Set<Entity>()
    client: SocketPortalClient
    end = new ReceivingEnd()

    primaryPlayerTransmitter = new PrimaryPlayerTransmitter()

    private world: ServerGameWorld
    private tank: EntityModel

    constructor() {
        this.tankEventHandler.on("tick", () => this.updateVisibleEntities())
    }

    setWorld(world: ServerGameWorld) {
        if(this.world) {
            let transmitComponent = this.world.getComponent(EntityDataTransmitComponent)
            transmitComponent.getTransmitterSet(this.end).detachTransmitters()
        }

        this.world = world
        this.end.setRoot(world)

        if(this.world) {
            let transmitComponent = this.world.getComponent(EntityDataTransmitComponent)
            let transmitterSet = transmitComponent.getTransmitterSet(this.end)

            transmitterSet.attachTransmitter(new EffectTransmitter())
            transmitterSet.attachTransmitter(new MapTransmitter())
            transmitterSet.attachTransmitter(this.primaryPlayerTransmitter)
        }
    }

    setTank(tank: EntityModel) {
        this.tank = tank
        this.tankEventHandler.setTarget(tank)
    }

    private updateVisibleEntities() {
        // This code is bad on purpose. I'm forcing myself to
        // rewrite this in the future.

        for(let entity of this.tank.parent.children) {
            let transform = entity.getComponent(TransformComponent)
            if(!transform) continue

            let position = transform.getPosition()
            let myPosition = this.tank.getComponent(PhysicalComponent).getBody().GetPosition()

            position.x -= myPosition.x
            position.y -= myPosition.y

            let length = Math.sqrt(position.x * position.x + position.y * position.y)

            let visible = length < 40

            if(visible == this.visibleEntities.has(entity)) continue;

            let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
            if(!transmitComponent) continue

            let transmitterSet = transmitComponent.getTransmitterSet(this.end)

            if(visible) {
                transmitterSet.attachTransmitter(new EntityStateTransmitter())
                transmitterSet.attachTransmitter(new EffectTransmitter())
                transmitterSet.attachTransmitter(new PositionTransmitter())
                transmitterSet.attachTransmitter(new HealthTransmitter())
                if(entity == this.tank) this.primaryPlayerTransmitter.setEntity(this.tank)
                this.visibleEntities.add(entity)
            } else {
                if(entity == this.tank) this.primaryPlayerTransmitter.setEntity(null)
                transmitterSet.detachTransmitters()
                this.visibleEntities.delete(entity)
            }
        }
    }
}