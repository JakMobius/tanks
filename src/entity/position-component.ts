import {Component} from "../utils/ecs/component";
import * as Box2D from "../library/box2d";
import Entity from "../utils/ecs/entity";

export default class PositionComponent implements Component {
    entity: Entity | null
    position?: Box2D.Vec2

    constructor(position?: Box2D.Vec2) {
        if(position) {
            this.position = position;
        } else {
            this.position = new Box2D.Vec2();
        }
    }

    onAttach(entity: Entity) {
        this.entity = entity;
    }

    onDetach() {
        this.entity = null
    }
}