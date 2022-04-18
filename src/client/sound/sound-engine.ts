import Downloader from '../utils/downloader';
import Sound, {SoundConfig} from './sound';
import FX from './fx';
import Progress from "../utils/progress";
import Camera from "../camera";

window.AudioContext = window.AudioContext || (window as any)["webkitAudioContext"]

class SoundEngine {
	public context = new AudioContext();
	public sound: AudioBuffer[] = [];
	public index: number;
	public audioEnabled: boolean;
	public camera: Camera;

    constructor() {

    }

    download(progress: Progress, index: number) {
        return Downloader.download(FX.sounds, (response: ArrayBuffer) => {
            this.context.decodeAudioData(response, (buffer: AudioBuffer) => {
                this.sound[index] = buffer;
            });
        }, "arraybuffer", progress)
    }

    playSound(s: number, options?: SoundConfig) {
        options = options || {}

        if(options.mapX !== undefined) {
            options.shouldPan = true
        }

        const sound = new Sound(this.context, this.sound[s], options);

        if(this.audioEnabled) {

            sound.init()

            if(options.mapX !== undefined && options.mapY !== undefined) {

                const filter = sound.context.createBiquadFilter();
                filter.type = "lowpass";
                const source = sound.panner || sound.gainNode;
                if(source) {
                    source.connect(filter)
                    source.disconnect(this.context.destination)
                    filter.connect(this.context.destination)

                    sound.lowpass = filter
                }

                this.updateSoundPosition(sound)
            } else {
                if(options.volume !== undefined && sound.gainNode) sound.gainNode.gain.value = options.volume
            }

            sound.play()
        }

        return sound
    }

    updateSoundPosition(sound: Sound, camera?: Camera) {

        const options = sound.config;

        const distance = Math.sqrt(Math.pow(options.mapX - camera.position.x, 2) + Math.pow(options.mapY - camera.position.y, 2)) / 20;

        if(sound.lowpass) {
            const freq = 25000 / (distance + 10) * 10;
            sound.lowpass.frequency.value = Math.max(0, Math.min(freq, sound.lowpass.frequency.maxValue))
        }

        sound.setPan((options.mapX - this.camera.position.x) / 200)

        let volume = Math.max(0, 1 - distance / 20) ** 2;
        if(options.volume !== undefined) {
            volume *= options.volume
        }

        if(sound.gainNode) sound.gainNode.gain.value = volume
    }
}

export default SoundEngine;