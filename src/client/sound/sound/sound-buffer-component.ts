import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import SoundPrimaryComponent from "src/client/sound/sound/sound-primary-component";
import {SoundAsset} from "src/client/sound/sounds";

export default class SoundBufferComponent implements Component {

    entity: Entity

    source: AudioBufferSourceNode

    constructor(source: AudioBufferSourceNode) {
        this.source = source

        this.source.onended = () => {
            if (this.source.loop) return
            this.entity.emit("ended")
        }
    }

    play() {
        this.source.start(this.source.context.currentTime);
        this.entity.emit("play")
        return this
    }

    stop() {
        this.source.stop(this.source.context.currentTime);
        this.entity.emit("stop")
        return this
    }

    setLoop(loop: boolean) {
        this.source.loop = loop
        return this
    }

    setPlaybackRate(rate: number) {
        this.source.playbackRate.value = rate
        return this
    }


    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    static createSoundFromBuffer(sound: SoundAsset) {
        let entity = new Entity()

        let bufferSource = sound.engine.context.createBufferSource()
        bufferSource.buffer = sound.buffer

        let gainNode = new GainNode(sound.engine.context)
        gainNode.gain.value = sound.volume

        bufferSource.connect(gainNode)

        let component = new SoundPrimaryComponent()
        let bufferComponent = new SoundBufferComponent(bufferSource)

        component.setSource(gainNode)
        entity.addComponent(component)
        entity.addComponent(bufferComponent)
        return entity
    }

}