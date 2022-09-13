import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class SailingComponent implements Component {
    entity: Entity | null;

    sailingFactor: number = 0

    constructor(factor: number) {
        this.sailingFactor = factor
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

}