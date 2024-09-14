
import EventEmitter from "src/utils/event-emitter";
import GameSettings from "src/client/settings/game-settings";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";

window.AudioContext = window.AudioContext || (window as any)["webkitAudioContext"]

export default class SoundEngine extends EventEmitter {
    public context: AudioContext
    public input: GainNode
    public enabled = false

    private audioSettingsListener = new BasicEventHandlerSet()

    constructor(context: AudioContext) {
        super()
        this.context = context
        this.input = new GainNode(this.context)
        this.setEnabled(true)

        this.audioSettingsListener.on("volume-set", (volume: number) => {
            this.setVolume(volume);
        })
    }

    private setVolume(volume: number) {
        this.input.gain.value = volume
    }

    resume() {
        if(this.enabled) return

        if(this.context.state === 'suspended') {
            this.context.resume()
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled
        if (this.enabled) {
            this.context.resume()
            this.audioSettingsListener.setTarget(GameSettings.getInstance().audio)
            this.setVolume(GameSettings.getInstance().audio.getVolume());
        } else {
            this.context.suspend()
            this.audioSettingsListener.setTarget(null)
        }
    }
}