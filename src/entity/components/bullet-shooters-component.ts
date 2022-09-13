import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import Player from "src/server/player";

export default class BulletShootersComponent implements Component {
    entity: Entity | null;
    shooters: Player[] = []

    constructor(shooters: Player[] = []) {
        this.shooters = shooters
    }

    addShooter(player: Player) {
        this.shooters.push(player)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}