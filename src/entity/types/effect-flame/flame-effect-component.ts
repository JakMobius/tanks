import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class FlameEffectComponent implements Component {
    entity: Entity | null = null

    setFiring(firing: boolean) {
        this.entity.emit("set-firing", firing)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}