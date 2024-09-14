import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import {SoundStream} from "src/client/sound/stream/sound-stream";
import SoundPrimaryComponent from "src/client/sound/sound/sound-primary-component";
import SoundEngine from "src/client/sound/sound-engine";

export default class WorldSoundListenerComponent implements Component {
    entity: Entity | null;

    node: AudioNode
    engine: SoundEngine
    sounds = new Set<SoundPrimaryComponent>()

    private tickListener = () => this.tick()

    constructor(engine: SoundEngine) {
        this.engine = engine
        this.node = new GainNode(this.engine.context)
    }

    onAttach(entity: Entity): void {
        this.engine.on("tick", this.tickListener)
        this.node.connect(this.engine.input)
        this.entity = entity
    }

    onDetach(): void {
        this.engine.off("tick", this.tickListener)
        this.node.disconnect(this.engine.input)
        this.entity = null
        this.sounds.clear()
    }

    tick() {
        for (let sound of this.sounds) {
            sound.entity.emit("tick")
        }
    }
}