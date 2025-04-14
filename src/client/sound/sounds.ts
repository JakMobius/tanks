import { SoundType } from "src/sound/sounds";

export interface SoundConfig {
    path: string
    volume?: number
}

export const SoundAssets = new Map<number, SoundConfig>([
    [SoundType.RELOAD_START, {
        path: "/static/sound/reload_start.mp3",
    }],
    [SoundType.RELOAD_END, {
        path: "/static/sound/reload_end.mp3",
    }],
    [SoundType.SHOOT_16MM, {
        path: "/static/sound/16mm-shoot.mp3",
    }],
    [SoundType.SHOOT_SHOTGUN, {
        path: "/static/sound/shotgun-shoot.mp3",
    }],
    [SoundType.SHOOT_SNIPER, {
        path: "/static/sound/sniper-shoot.mp3",
    }],
    [SoundType.SHOOT_BOMBER, {
        path: "/static/sound/bomber-shoot.mp3",
    }],
    [SoundType.SHOOT_MORTAR, {
        path: "/static/sound/mortar-shoot.mp3",
    }],
    [SoundType.FLAMETHROWER_START, {
        path: "/static/sound/flamethrower-sound-start.mp3",
        volume: 0.5,
    }],
    [SoundType.FLAMETHROWER_SOUND, {
        path: "/static/sound/flamethrower-sound.mp3",
        volume: 0.5,
    }],
    [SoundType.TESLA_START, {
        path: "/static/sound/tesla-sound-start.mp3",
    }],
    [SoundType.TESLA_SOUND, {
        path: "/static/sound/tesla-sound.mp3",
    }],
    [SoundType.ENGINE_1, {
        path: "/static/sound/engine-1.mp3",
        volume: 0.3,
    }],
    [SoundType.ENGINE_2, {
        path: "/static/sound/engine-2.mp3",
        volume: 0.3,
    }],
    [SoundType.ENGINE_3, {
        path: "/static/sound/engine-3.mp3",
        volume: 0.3,
    }],
    [SoundType.ENGINE_4, {
        path: "/static/sound/engine-4.mp3",
        volume: 0.3,
    }],
    [SoundType.EXPLODE_1, {
        path: "/static/sound/explode-1.mp3",
        volume: 0.2,
    }],
    [SoundType.EXPLODE_2, {
        path: "/static/sound/explode-2.mp3",
        volume: 0.4,
    }],
    [SoundType.EXPLODE_3, {
        path: "/static/sound/explode-3.mp3",
        volume: 0.4,
    }],
    [SoundType.EXPLODE_4, {
        path: "/static/sound/explode-4.mp3",
        volume: 0.9,
    }]
])