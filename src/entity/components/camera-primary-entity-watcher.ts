import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import PrimaryPlayerReceiver from "./network/primary-player/primary-player-receiver";
import PhysicalComponent from "./physics-component";
import CameraPositionController from "./camera-position-controller";
import Entity from "src/utils/ecs/entity";
import { Component } from "src/utils/ecs/component";


export default class CameraPrimaryEntityController implements Component {
    
    worldEventHandler = new BasicEventHandlerSet()
    world: Entity | null = null
    entity?: Entity;

    constructor() {
        this.worldEventHandler.on("primary-entity-set", () => this.updatePrimaryEntity())
    }

    setWorld(world: Entity | null) {
        this.world = world
        this.worldEventHandler.setTarget(world)
        this.updatePrimaryEntity()
        return this
    }

    onDetach() {
        this.entity = null
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.updatePrimaryEntity()
    }

    private updatePrimaryEntity() {
        if(!this.entity) return

        let primaryEntity = this.world?.getComponent(PrimaryPlayerReceiver)?.primaryEntity
        
        if (primaryEntity) {
            let body = primaryEntity.getComponent(PhysicalComponent).getBody()
            this.entity.getComponent(CameraPositionController)
                .setTarget(body.GetPosition())
                .setTargetVelocity(body.GetLinearVelocity())
                .update()
                .setInertial(true)
        } else {
            this.entity.getComponent(CameraPositionController)
                .setTarget(null)
                .setTargetVelocity(null)
                .setInertial(false)
        }
    }
}