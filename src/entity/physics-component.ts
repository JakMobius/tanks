import {Component} from "../utils/ecs/component";
import * as Box2D from "../library/box2d";
import Entity from "../utils/ecs/entity";
import PositionComponent from "./position-component";
import PhysicalHostComponent from "../physics-world";

export default class PhysicalComponent implements Component {
    entity: Entity | null
    body: Box2D.Body
    host: PhysicalHostComponent

    private positionComponent?: PositionComponent

    constructor(body: Box2D.Body, host: PhysicalHostComponent) {
        this.body = body
        this.host = host
    }

    getPositionComponent() {
        if(!this.positionComponent || this.positionComponent.entity != this.entity) {
            this.positionComponent = this.entity.getComponent(PositionComponent)
        }
        return this.positionComponent;
    }

    onPhysicsTick(dt: number) {
        let positionComponent = this.getPositionComponent();
        positionComponent.position = this.body.GetPosition();
        this.entity.emit("physics-tick", dt)
    }

    onDetach() {
        this.entity = null
        this.body.GetWorld().DestroyBody(this.body)
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