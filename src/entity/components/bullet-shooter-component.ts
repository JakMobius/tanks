import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class BulletShooterComponent implements Component {
    entity: Entity | null;
    shooter: Entity

    constructor(shooter: Entity) {
        this.shooter = shooter
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}