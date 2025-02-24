import Entity from "src/utils/ecs/entity";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import SoundEngine from "../sound-engine";
import { SoundType } from "src/sound/sounds";
import { SoundAssets } from "../sounds";
import EventEmitter from "src/utils/event-emitter";
import { SoundFilterSet } from "../stream/sound-stream";

export class SoundSource extends EventEmitter {
    filterSet: SoundFilterSet

    constructor(engine: SoundEngine) {
        super()
        this.filterSet = new SoundFilterSet(engine.context)
    }

    start() {
        this.emit("start")
    }

    stop() {
        this.emit("stop")
    }

    connect(node: AudioNode) {
        this.filterSet.output.connect(node)
    }
    
    disconnect(node: AudioNode) {
        this.filterSet.output.disconnect(node)
    }

    setVolume(volume: number) {
        this.filterSet.input.gain.value = volume
    }
}

export class BufferSoundSource extends SoundSource {
    bufferSource: AudioBufferSourceNode
    gainNode: GainNode

    constructor(engine: SoundEngine, sound: SoundType) {
        super(engine)

        this.bufferSource = new AudioBufferSourceNode(engine.context, {
            buffer: engine.soundBuffers[sound]
        })

        this.gainNode = new GainNode(engine.context)
        this.gainNode.gain.value = SoundAssets.get(sound).volume ?? 1.0

        this.bufferSource.connect(this.gainNode)
        this.gainNode.connect(this.filterSet.input)
    }

    setLoop(loop: boolean) {
        this.bufferSource.loop = loop
        return this
    }

    override start() {
        super.start()
        this.bufferSource.onended = () => {
            if (this.bufferSource.loop) return
            this.emit("ended")
        }
        this.bufferSource.start()

        return this
    }

    override stop() {
        super.stop()
        this.bufferSource.stop()
        this.bufferSource.onended = null
        return this
    }
}

type SoundSourceFactory = (listener: WorldSoundListenerComponent) => SoundSource

export default class SoundPrimaryComponent extends EventHandlerComponent {
    
    public volume: number = 1.0

    soundSources = new Map<Entity, SoundSource>()
    soundFactory: SoundSourceFactory

    constructor(soundFactory: SoundSourceFactory) {
        super()

        this.soundFactory = soundFactory

        this.eventHandler.on("camera-attach", (camera) => this.addCamera(camera))
        this.eventHandler.on("camera-detach", (camera) => this.removeCamera(camera))
    }

    setVolume(volume: number) {
        this.volume = volume
        for (let stream of this.soundSources.values()) {
            stream.setVolume(volume)
        }
        return this
    }

    private addCamera(camera: Entity) {
        let listener = camera?.getComponent(WorldSoundListenerComponent)
        if (!listener) return

        let soundSource = this.soundFactory(listener)
        soundSource.setVolume(this.volume)
        soundSource.connect(listener.node)
        soundSource.on("ended", () => {
            this.removeCamera(camera)
        })
        this.soundSources.set(camera, soundSource)
    }

    private removeCamera(camera: Entity) {
        if (!this.soundSources.has(camera)) return
        let listener = camera?.getComponent(WorldSoundListenerComponent)
        if (!listener) return

        let soundSource = this.soundSources.get(camera)
        // It's important to stop the node here, otherwise it won't be GC-collected
        soundSource.stop()
        soundSource.disconnect(listener.node)
        this.soundSources.delete(camera)

        if(!this.soundSources) [
            this.entity.emit("ended")
        ]
    }

    startAll() {
        if(this.soundSources.size === 0) {
            this.entity.emit("ended")
            return
        }

        for(let source of this.soundSources.values()) {
            source.start()
        }
    }
    
    stopAll() {
        for(let source of this.soundSources.values()) {
            source.stop()
        }
    }
}