import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import SoundEngine from "../../sound/sound-engine";

export default class SoundHostComponent implements Component {

    entity: Entity | null
    engine: SoundEngine

    constructor(engine: SoundEngine) {
        this.engine = engine
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}