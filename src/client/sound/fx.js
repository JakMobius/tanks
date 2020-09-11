
class FX {
    static RELOAD_START = 0
    static RELOAD_END = 1
    static SHOOT_16MM = 2
    static SHOOT_SHOTGUN = 3
    static SHOOT_SNIPER = 4
    static SHOOT_BOMBER = 5
    static SHOOT_MORTAR = 6
    static FLAMETHROWER_START = 7
    static FLAMETHROWER_SOUND = 8
    static TESLA_START = 9
    static TESLA_SOUND = 10
    static ENGINE_1 = 15
    static ENGINE_2 = 16
    static ENGINE_3 = 17
    static ENGINE_4 = 18

    static sounds = [
        /*  0 */ "assets/sound/reload_start.wav",
        /*  1 */ "assets/sound/reload_end.wav",
        /*  2 */ "assets/sound/16mm-shoot.wav",
        /*  3 */ "assets/sound/shotgun-shoot.wav",
        /*  4 */ "assets/sound/sniper-shoot.wav",
        /*  5 */ "assets/sound/bomber-shoot.wav",
        /*  6 */ "assets/sound/mortar-shoot.wav",
        /*  7 */ "assets/sound/flamethrower-sound-start.wav",
        /*  8 */ "assets/sound/flamethrower-sound.wav",
        /*  9 */ "assets/sound/tesla-sound-start.wav",
        /* 10 */ "assets/sound/tesla-sound.wav",
        /* 11 */ "assets/sound/serverworldexplodeeffect-1.wav",
        /* 12 */ "assets/sound/serverworldexplodeeffect-2.wav",
        /* 13 */ "assets/sound/serverworldexplodeeffect-3.wav",
        /* 14 */ "assets/sound/serverworldexplodeeffect-4.wav",
        /* 15 */ "assets/sound/engine-1.wav",
        /* 16 */ "assets/sound/engine-2.wav",
        /* 17 */ "assets/sound/engine-3.wav",
        /* 18 */ "assets/sound/engine-4.wav"
    ]

    static randomExplosion() {
        return Math.floor(Math.random() * 4) + 11
    }
}

module.exports = FX