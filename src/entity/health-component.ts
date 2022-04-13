import {Component} from "../utils/ecs/component";
import Entity from "../utils/ecs/entity";

export default class HealthComponent implements Component {
    private health: number
    entity: Entity | null;

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    setHealth(health: number) {
        this.health = health
        this.entity.emit("health-set")
    }

    getHealth() {
        return this.health
    }

    damage(damage: number) {
        this.setHealth(Math.max(0, this.health - damage))
    }
}