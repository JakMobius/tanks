import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import Player from "../../server/player";

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