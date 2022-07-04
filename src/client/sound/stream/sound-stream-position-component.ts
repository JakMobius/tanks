import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import * as Box2D from "../../../library/box2d";

export class SoundStreamPositionComponent implements Component {
    entity: Entity | null;
    position: Box2D.XY | null = null
    velocity: Box2D.XY = { x: 0, y: 0 }

    onAttach(entity: Entity): void {
        this.entity = entity;
    }

    onDetach(): void {
        this.entity = null;
    }
}