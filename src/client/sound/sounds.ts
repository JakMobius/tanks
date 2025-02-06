import SoundEngine from "./sound-engine";
import {SoundType} from "src/sound/sounds";

export class SoundAsset {
    path: string
    buffer: AudioBuffer | null = null
    engine: SoundEngine | null = null
    volume: number = 1.0

    constructor(path: string) {
        this.path = path
    }

    withVolume(volume: number) {
        this.volume = volume
        return this
    }

    createBufferSource() {
        if (!this.engine) return null

        let node = new AudioBufferSourceNode(this.engine.context)
        node.buffer = SoundAssets[SoundType.FLAMETHROWER_START].buffer
        return node
    }

    createGainNode() {
        if (!this.engine) return null

        let node = new GainNode(this.engine.context)
        node.gain.value = this.volume
        return node
    }
}

export const SoundAssets: { [key: number]: SoundAsset | undefined } = {
    [SoundType.RELOAD_START]: new SoundAsset("static/sound/reload_start.wav"),
    [SoundType.RELOAD_END]: new SoundAsset("static/sound/reload_end.wav"),
    [SoundType.SHOOT_16MM]: new SoundAsset("static/sound/16mm-shoot.wav"),
    [SoundType.SHOOT_SHOTGUN]: new SoundAsset("static/sound/shotgun-shoot.wav"),
    [SoundType.SHOOT_SNIPER]: new SoundAsset("static/sound/sniper-shoot.wav"),
    [SoundType.SHOOT_BOMBER]: new SoundAsset("static/sound/bomber-shoot.wav"),
    [SoundType.SHOOT_MORTAR]: new SoundAsset("static/sound/mortar-shoot.wav"),
    [SoundType.FLAMETHROWER_START]: new SoundAsset("static/sound/flamethrower-sound-start.wav").withVolume(0.5),
    [SoundType.FLAMETHROWER_SOUND]: new SoundAsset("static/sound/flamethrower-sound.wav").withVolume(0.5),
    [SoundType.TESLA_START]: new SoundAsset("static/sound/tesla-sound-start.wav"),
    [SoundType.TESLA_SOUND]: new SoundAsset("static/sound/tesla-sound.wav"),
    [SoundType.ENGINE_1]: new SoundAsset("static/sound/engine-1.wav").withVolume(0.3),
    [SoundType.ENGINE_2]: new SoundAsset("static/sound/engine-2.wav").withVolume(0.3),
    [SoundType.ENGINE_3]: new SoundAsset("static/sound/engine-3.wav").withVolume(0.3),
    [SoundType.ENGINE_4]: new SoundAsset("static/sound/engine-4.wav").withVolume(0.3),
    [SoundType.EXPLODE_1]: new SoundAsset("static/sound/explode-1.wav").withVolume(0.2),
    [SoundType.EXPLODE_2]: new SoundAsset("static/sound/explode-2.wav").withVolume(0.4),
    [SoundType.EXPLODE_3]: new SoundAsset("static/sound/explode-3.wav").withVolume(0.4),
    [SoundType.EXPLODE_4]: new SoundAsset("static/sound/explode-4.wav").withVolume(0.9),
}