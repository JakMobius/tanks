import SoundEngine from "./sound-engine";

export class SoundAsset {
    path: string
    buffer: AudioBuffer | null = null
    engine: SoundEngine | null = null

    constructor(path: string) {
        this.path = path
    }
}

export default class Sounds {
    static RELOAD_START =       new SoundAsset("assets/sound/reload_start.wav")
    static RELOAD_END =         new SoundAsset("assets/sound/reload_end.wav")
    static SHOOT_16MM =         new SoundAsset("assets/sound/16mm-shoot.wav")
    static SHOOT_SHOTGUN =      new SoundAsset("assets/sound/shotgun-shoot.wav")
    static SHOOT_SNIPER =       new SoundAsset("assets/sound/sniper-shoot.wav")
    static SHOOT_BOMBER =       new SoundAsset("assets/sound/bomber-shoot.wav")
    static SHOOT_MORTAR =       new SoundAsset("assets/sound/mortar-shoot.wav")
    static FLAMETHROWER_START = new SoundAsset("assets/sound/flamethrower-sound-start.wav")
    static FLAMETHROWER_SOUND = new SoundAsset("assets/sound/flamethrower-sound.wav")
    static TESLA_START =        new SoundAsset("assets/sound/tesla-sound-start.wav")
    static TESLA_SOUND =        new SoundAsset("assets/sound/tesla-sound.wav")
    static ENGINE_1 =           new SoundAsset("assets/sound/engine-1.wav")
    static ENGINE_2 =           new SoundAsset("assets/sound/engine-2.wav")
    static ENGINE_3 =           new SoundAsset("assets/sound/engine-3.wav")
    static ENGINE_4 =           new SoundAsset("assets/sound/engine-4.wav")
    static EXPLODE_1 =           new SoundAsset("assets/sound/explode-1.wav")
    static EXPLODE_2 =           new SoundAsset("assets/sound/explode-2.wav")
    static EXPLODE_3 =           new SoundAsset("assets/sound/explode-3.wav")
    static EXPLODE_4 =           new SoundAsset("assets/sound/explode-4.wav")

    static ALL = [
        Sounds.RELOAD_START,
        Sounds.RELOAD_END,
        Sounds.SHOOT_16MM,
        Sounds.SHOOT_SHOTGUN,
        Sounds.SHOOT_SNIPER,
        Sounds.SHOOT_BOMBER,
        Sounds.SHOOT_MORTAR,
        Sounds.FLAMETHROWER_START,
        Sounds.FLAMETHROWER_SOUND,
        Sounds.TESLA_START,
        Sounds.TESLA_SOUND,
        Sounds.ENGINE_1,
        Sounds.ENGINE_2,
        Sounds.ENGINE_3,
        Sounds.ENGINE_4,
        Sounds.EXPLODE_1,
        Sounds.EXPLODE_2,
        Sounds.EXPLODE_3,
        Sounds.EXPLODE_4
    ]
}