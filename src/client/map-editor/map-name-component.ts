import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";

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