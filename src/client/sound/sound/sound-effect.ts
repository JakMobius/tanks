import {SoundStream} from "../stream/sound-stream";

export default abstract class SoundEffect {
    previousEffect: SoundEffect | null
    nextEffect: SoundEffect | null

    abstract getInput(): AudioNode
    abstract getOutput(): AudioNode

    stream: SoundStream

    protected constructor(stream: SoundStream) {
        this.stream = stream
    }

    connected = false

    ensureConnected() {
        if(!this.connected) {
            this.stream.addEffect(this)
            this.connected = true
        }
    }

    ensureDisconnected() {
        if(this.connected) {
            this.stream.removeEffect(this)
            this.connected = false
        }
    }
}