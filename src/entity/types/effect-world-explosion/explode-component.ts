import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import { WorldComponent } from "src/entity/game-world-entity-prefab";
import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class ExplodeComponent implements Component {
    entity: Entity | null = null

    explode(x: number, y: number, power: number) {
        WorldComponent.getWorld(this.entity).getComponent(ExplodeEffectPool).start(x, y, power)
        this.entity.emit("explode", x, y, power)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}