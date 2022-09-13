import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class GameMapNameComponent implements Component {

    name: string = "Безымянная карта"
    entity: Entity | null

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

}