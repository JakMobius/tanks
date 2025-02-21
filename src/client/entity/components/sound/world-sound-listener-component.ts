import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import SoundEngine from "src/client/sound/sound-engine";

export default class WorldSoundListenerComponent implements Component {
    entity: Entity | null;

    node: AudioNode
    engine: SoundEngine

    constructor(engine: SoundEngine) {
        this.engine = engine
        this.node = new GainNode(this.engine.context)
    }

    onAttach(entity: Entity): void {
        this.node.connect(this.engine.input)
        this.entity = entity
    }

    onDetach(): void {
        this.node.disconnect(this.engine.input)
        this.entity = null
    }
}