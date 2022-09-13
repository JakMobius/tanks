import * as Box2D from "src/library/box2d";
import {Component} from "src/utils/ecs/component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import Entity from "src/utils/ecs/entity";
import PhysicalComponent from "src/entity/components/physics-component";

export default class BulletLauncher implements Component {
    entity: Entity
    private eventHandler = new BasicEventHandlerSet();

    constructor(position: Box2D.XY, angle: number) {
        this.eventHandler.on("physical-body-created", (component: PhysicalComponent) => {
            component.setPosition(position)
            component.setAngle(angle)
            this.entity.emit("bullet-launch")
            this.entity.removeComponent(BulletLauncher)
        })
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(this.entity)
    }
}