import Entity from "src/utils/ecs/entity";
import {SoundStream} from "../stream/sound-stream";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class SoundPrimaryComponent extends EventHandlerComponent {
    public source: AudioNode;
    public connected: boolean
    public volume: number = 1.0

    streams = new Map<Entity, SoundStream>()

    constructor() {
        super()

        this.eventHandler.on("camera-attach", (camera) => this.addCamera(camera))
        this.eventHandler.on("camera-detach", (camera) => this.removeCamera(camera))
    }

    setVolume(volume: number) {
        this.volume = volume
        for (let stream of this.streams.values()) {
            stream.input.gain.value = this.volume
        }
        return this
    }

    setSource(source: AudioNode) {

        if (this.source) {
            for (let stream of this.streams.values()) {
                this.source.disconnect(stream.input)
            }
        }

        this.source = source

        if (this.source) {
            for (let stream of this.streams.values()) {
                this.source.connect(stream.input)
            }
        }
        return this
    }

    private addCamera(camera: Entity) {
        let listener = camera?.getComponent(WorldSoundListenerComponent)
        if (!listener) return

        listener.sounds.add(this)
        let stream = new SoundStream(this.source.context)
        stream.input.gain.value = this.volume

        if (this.source) {
            this.source.connect(stream.input)
        }
        stream.output.connect(listener.node)
        this.streams.set(camera, stream)
    }

    private removeCamera(camera: Entity) {
        let listener = camera?.getComponent(WorldSoundListenerComponent)
        if (!listener) return

        listener.sounds.delete(this)
        let stream = this.streams.get(camera)
        if (this.source) {
            this.source.disconnect(stream.input)
        }
        stream.output.disconnect(listener.node)
        this.streams.delete(camera)
    }
}