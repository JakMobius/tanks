import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class GameMapSizeComponent implements Component {
    size: number = 0
    entity: Entity | null

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

}