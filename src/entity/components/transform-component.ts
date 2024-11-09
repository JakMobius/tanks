import {Component} from "src/utils/ecs/component";
import * as Box2D from "src/library/box2d";
import Entity from "src/utils/ecs/entity";
import Matrix3 from "src/utils/matrix3";
import {Vec2} from "src/library/box2d";

export default class TransformComponent implements Component {
    entity: Entity | null
    transform: Matrix3

    constructor(transform?: Matrix3) {
        if (transform) {
            this.transform = transform;
        } else {
            this.transform = new Matrix3();
        }
    }

    setPosition(position: Box2D.XY) {
        const currentPosition = this.getPosition()
        this.transform.translate(position.x - currentPosition.x, position.y - currentPosition.y)
    }

    getAngle(): number {
        return Math.atan2(this.transform.m[1], this.transform.m[0]);
    }

    getPosition() {
        return new Box2D.Vec2(this.transform.m[6], this.transform.m[7])
    }

    getDirection() {
        return new Box2D.Vec2(this.transform.m[0], this.transform.m[1])
    }

    onAttach(entity: Entity) {
        this.entity = entity;
    }

    onDetach() {
        this.entity = null
    }
}