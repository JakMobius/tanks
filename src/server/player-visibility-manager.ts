import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import Entity from "../utils/ecs/entity";
import ServerGameWorld from "./server-game-world";
import EntityDataTransmitComponent from "../entity/components/network/transmitting/entity-data-transmit-component";
import TransformComponent from "../entity/components/transform-component";
import PhysicalComponent from "../entity/components/physics-component";
import SocketPortalClient from "./socket/socket-portal-client";
import {ReceivingEnd} from "../entity/components/network/transmitting/receiving-end";
import PrimaryPlayerTransmitter from "../entity/components/network/primary-player/primary-player-transmitter";
import EntityModel from "../entity/entity-model";
import {b2Vec2} from "../library/box2d/common/b2_math";

export default class PlayerVisibilityManager {
    // This code is still not perfect, but it's much
    // better than it was before

    tankEventHandler = new BasicEventHandlerSet()
    client: SocketPortalClient
    end = new ReceivingEnd()

    private primaryPlayerTransmitter = new PrimaryPlayerTransmitter()
    private visibleEntities = new Set<Entity>()
    private world: ServerGameWorld
    private tank: EntityModel

    constructor() {
        this.tankEventHandler.on("tick", () => this.updateEntitiesVisibility())
    }

    setWorld(world: ServerGameWorld) {
        if(this.world) {
            let transmitComponent = this.world.getComponent(EntityDataTransmitComponent)
            if(transmitComponent.hasTransmitterSetForEnd(this.end)) {
                transmitComponent.transmitterSetFor(this.end).detachTransmitters()
            }
        }

        this.world = world
        this.end.setRoot(world)

        if(this.world) {
            let transmitComponent = this.world.getComponent(EntityDataTransmitComponent)
            let transmitterSet = transmitComponent.transmitterSetFor(this.end)
            transmitterSet.attachTransmitter(this.primaryPlayerTransmitter)
        }
    }

    setTank(tank: EntityModel) {
        this.tank = tank
        this.tankEventHandler.setTarget(tank)
    }

    private updateEntitiesVisibility() {
        let playerPosition = this.tank.getComponent(PhysicalComponent).getBody().GetPosition()
        let entityPosition = new b2Vec2();

        for(let entity of this.tank.parent.children) {
            let transform = entity.getComponent(TransformComponent)
            if(!transform) continue

            let offset = entityPosition.Copy(transform.getPosition()).SelfSub(playerPosition)
            let visible = offset.LengthSquared() < 40 ** 2

            this.setEntityVisibile(entity, visible)
        }
    }

    private makeEntityVisible(entity: Entity) {
        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        if(!transmitComponent) return

        transmitComponent.transmitterSetFor(this.end)
        if(entity == this.tank) this.primaryPlayerTransmitter.setEntity(this.tank)
    }

    private makeEntityInvisible(entity: Entity) {
        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        if(!transmitComponent) return

        if(entity == this.tank) this.primaryPlayerTransmitter.setEntity(null)

        if(!transmitComponent.hasTransmitterSetForEnd(this.end)) return
        transmitComponent.transmitterSetFor(this.end).detachTransmitters()
    }

    private setEntityVisibile(entity: Entity, visible: boolean) {
        if(visible == this.visibleEntities.has(entity)) return

        if(visible) {
            this.visibleEntities.add(entity)
            this.makeEntityVisible(entity)
        } else {
            this.visibleEntities.delete(entity)
            this.makeEntityInvisible(entity)
        }
    }
}