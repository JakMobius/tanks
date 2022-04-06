import {Component} from "../utils/ecs/component";
import * as Box2D from "../library/box2d";
import Entity from "../utils/ecs/entity";
import TransformComponent from "./transform-component";
import PhysicalHostComponent from "../physiсal-world-component";

export default class PhysicalComponent implements Component {
    entity: Entity | null
    body: Box2D.Body
    host: PhysicalHostComponent

    private positionComponent?: TransformComponent

    constructor(body: Box2D.Body, host: PhysicalHostComponent) {
        this.body = body
        this.host = host
    }

    getPositionComponent() {
        if(!this.positionComponent || this.positionComponent.entity != this.entity) {
            this.positionComponent = this.entity.getComponent(TransformComponent)
        }
        return this.positionComponent;
    }

    onPhysicsTick(dt: number) {
        const transformComponent = this.getPositionComponent().transform
        const position = this.body.GetPosition()

        transformComponent.reset()
        transformComponent.translate(position.x, position.y)
        transformComponent.rotate(-this.body.GetAngle())

        this.entity.emit("physics-tick", dt)
    }

    onDetach() {
        this.entity = null
        if(this.body.GetWorld()) {
            this.body.GetWorld().DestroyBody(this.body)
        }
        this.host.destroyComponent(this)
    }

    onAttach(entity: Entity) {
        this.entity = entity
        this.body.SetUserData(entity)
        this.host.registerComponent(this)
    }

    getBody() {
        return this.body
    }
}