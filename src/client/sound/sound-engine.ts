
import SoundPrimaryComponent from './sound/sound-primary-component';
import Entity from "../../utils/ecs/entity";
import {SoundStreamPrimaryComponent} from "./stream/sound-stream-primary-component";
import EventEmitter from "../../utils/event-emitter";

window.AudioContext = window.AudioContext || (window as any)["webkitAudioContext"]

export default class SoundEngine extends EventEmitter {
    public context: AudioContext
    public outputs: Entity[] = []

    public currentSounds: Entity[] = []

    constructor(context: AudioContext) {
        super()
        this.context = context
    }

    async addSound(sound: Entity) {
        if(this.context.state === 'suspended') {
            this.context.resume()
        }

        sound.getComponent(SoundPrimaryComponent).setEngine(this)

        this.currentSounds.push(sound)
    }

    async removeSound(sound: Entity) {
        sound.getComponent(SoundPrimaryComponent).setEngine(null)

        this.currentSounds.splice(this.currentSounds.indexOf(sound), 1)
    }

    addOutput(node: AudioNode) {
        let output = new Entity()
        let stream = new SoundStreamPrimaryComponent(this)
        output.addComponent(stream)
        stream.destination.connect(node)
        this.outputs.push(output)
        return output
    }

    removeOutput(output: Entity) {
        this.outputs.splice(this.outputs.indexOf(output), 1)
    }
}