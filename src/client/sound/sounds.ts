import SoundEngine from "./sound-engine";
import { SoundType } from "src/sound/sounds";

export class SoundAsset {
    engine: SoundEngine
    config: SoundConfig

    constructor(engine: SoundEngine, config: SoundConfig) {
        this.engine = engine
        this.config = config
    }

    createBufferSource() {
        let node = new AudioBufferSourceNode(this.engine.context)
        node.buffer = this.engine.soundBuffers[SoundType.FLAMETHROWER_START]
        return node
    }

    createGainNode() {
        let node = new GainNode(this.engine.context)
        node.gain.value = this.config.volume
        return node
    }
}

export interface SoundConfig {
    path: string
    volume?: number
}

export const SoundAssets = new Map<number, SoundConfig>([
    [SoundType.RELOAD_START, {
        path: "static/sound/reload_start.wav",
    }],
    [SoundType.RELOAD_END, {
        path: "static/sound/reload_end.wav",
    }],
    [SoundType.SHOOT_16MM, {
        path: "static/sound/16mm-shoot.wav",
    }],
    [SoundType.SHOOT_SHOTGUN, {
        path: "static/sound/shotgun-shoot.wav",
    }],
    [SoundType.SHOOT_SNIPER, {
        path: "static/sound/sniper-shoot.wav",
    }],
    [SoundType.SHOOT_BOMBER, {
        path: "static/sound/bomber-shoot.wav",
    }],
    [SoundType.SHOOT_MORTAR, {
        path: "static/sound/mortar-shoot.wav",
    }],
    [SoundType.FLAMETHROWER_START, {
        path: "static/sound/flamethrower-sound-start.wav",
        volume: 0.5,
    }],
    [SoundType.FLAMETHROWER_SOUND, {
        path: "static/sound/flamethrower-sound.wav",
        volume: 0.5,
    }],
    [SoundType.TESLA_START, {
        path: "static/sound/tesla-sound-start.wav",
    }],
    [SoundType.TESLA_SOUND, {
        path: "static/sound/tesla-sound.wav",
    }],
    [SoundType.ENGINE_1, {
        path: "static/sound/engine-1.wav",
        volume: 0.3,
    }],
    [SoundType.ENGINE_2, {
        path: "static/sound/engine-2.wav",
        volume: 0.3,
    }],
    [SoundType.ENGINE_3, {
        path: "static/sound/engine-3.wav",
        volume: 0.3,
    }],
    [SoundType.ENGINE_4, {
        path: "static/sound/engine-4.wav",
        volume: 0.3,
    }],
    [SoundType.EXPLODE_1, {
        path: "static/sound/explode-1.wav",
        volume: 0.2,
    }],
    [SoundType.EXPLODE_2, {
        path: "static/sound/explode-2.wav",
        volume: 0.4,
    }],
    [SoundType.EXPLODE_3, {
        path: "static/sound/explode-3.wav",
        volume: 0.4,
    }],
    [SoundType.EXPLODE_4, {
        path: "static/sound/explode-4.wav",
        volume: 0.9,
    }]
])