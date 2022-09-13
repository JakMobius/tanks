import {Component} from "src/utils/ecs/component";
import * as Box2D from "src/library/box2d";
import Entity from "src/utils/ecs/entity";
import Matrix3 from "src/utils/matrix3";

export default class TransformComponent implements Component {
    entity: Entity | null
    transform: Matrix3

    constructor(transform?: Matrix3) {
        if(transform) {
            this.transform = transform;
        } else {
            this.transform = new Matrix3();
        }
    }

    setPosition(position: Box2D.XY) {
        const currentPosition = this.getPosition()
        this.transform.translate(position.x - currentPosition.x, position.y - currentPosition.y)
    }

    getPosition(): Box2D.XY {
        return {
            x: this.transform.transformX(0, 0, 1),
            y: this.transform.transformY(0, 0, 1)
        };
    }

    onAttach(entity: Entity) {
        this.entity = entity;
    }

    onDetach() {
        this.entity = null
    }
}