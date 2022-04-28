import * as Box2D from "../../library/box2d";
import EntityModel from "../../entity/entity-model";
import {Component} from "../../utils/ecs/component";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import Entity from "../../utils/ecs/entity";
import PhysicalComponent from "../../entity/components/physics-component";

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

    onAttach(entity: EntityModel): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(this.entity)
    }
}