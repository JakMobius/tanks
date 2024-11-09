import EventEmitter from "src/utils/event-emitter";

export interface SerializedGameAudioSettings {
    volume?: number
}

export default class GameAudioSettings extends EventEmitter {

    volume: number

    constructor(serialized?: SerializedGameAudioSettings) {
        super()
        serialized = Object.assign({
            volume: 0.5
        }, serialized)
        this.volume = serialized.volume
    }

    getVolume() {
        return this.volume
    }

    setVolume(volume: number) {
        this.volume = volume
        this.emit("volume-set", this.volume)
        this.emit("update")
    }

    serialize(): SerializedGameAudioSettings {
        return {
            volume: this.volume
        }
    }
}