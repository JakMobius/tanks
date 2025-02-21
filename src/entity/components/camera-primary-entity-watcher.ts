import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import PrimaryPlayerReceiver from "./network/primary-player/primary-player-receiver";
import PhysicalComponent from "./physics-component";
import CameraPositionController from "./camera-position-controller";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class CameraPrimaryEntityController extends EventHandlerComponent {
    
    worldEventHandler = new BasicEventHandlerSet()
    world: Entity | null = null

    constructor() {
        super()

        this.worldEventHandler.on("primary-entity-set", () => this.updatePrimaryEntity())
        this.eventHandler.on("attached-to-parent", () => this.updateWorld())
        this.eventHandler.on("detached-from-parent", () => this.updateWorld())
    }

    updateWorld() {
        // Camera entity is the only link between the game world and the document.
        // Its components should find the world entity by themselves and should not
        // keep the reference to it anywhere to prevent memory leaks.
        this.worldEventHandler.setTarget(this.entity.parent)
        this.updatePrimaryEntity()
        return this
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)
        this.updatePrimaryEntity()
    }

    private updatePrimaryEntity() {
        let world = this.entity?.parent
        if(!world) return

        let primaryEntity = world?.getComponent(PrimaryPlayerReceiver)?.primaryEntity
        
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