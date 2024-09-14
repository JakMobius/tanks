import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class PelletsEffectComponent implements Component {
    entity: Entity | null = null

    trigger() {
        this.entity.emit("trigger")
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}