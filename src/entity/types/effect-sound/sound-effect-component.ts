import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class SoundEffectComponent implements Component {
    entity: Entity | null = null

    playSound(x: number, y: number, index: number) {
        this.entity.emit("play-sound", x, y, index)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}