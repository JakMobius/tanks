import {SoundStream} from "./stream/sound-stream";
import EventEmitter from "src/utils/event-emitter";

window.AudioContext = window.AudioContext || (window as any)["webkitAudioContext"]

export default class SoundEngine extends EventEmitter {
    public context: AudioContext
    public outputs: SoundStream[] = []

    constructor(context: AudioContext) {
        super()
        this.context = context
    }

    resume() {
        if(this.context.state === 'suspended') {
            this.context.resume()
        }
    }

    addOutput(node: AudioNode) {
        let stream = new SoundStream(this)
        stream.output.connect(node)
        this.outputs.push(stream)
        return stream
    }

    removeOutput(output: SoundStream) {
        this.outputs.splice(this.outputs.indexOf(output), 1)
    }
}