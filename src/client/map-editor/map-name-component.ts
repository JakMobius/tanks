import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class GameMapNameComponent implements Component {

    name: string
    entity: Entity | null

    constructor(name?: string) {
        this.name = name ?? "Безымянная карта"
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

}