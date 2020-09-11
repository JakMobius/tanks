


class Weapon {
    constructor(config) {
        this.config = config
        this.name = config.name || "Weapon"
        this.maxAmmo = config.maxAmmo || Infinity
        this.shootRate = config.shootRate || 200
        this.reloadTime = config.reloadTime || 4.0
        this.bulletType = config.bulletType || Weapon.Bullets["42mm"]
        this.ammo = this.maxAmmo
        this._isReloading = false
        this.shootingTime = null
        this.sound = config.sound || {}
        this.game = config.game
    }

    reload() {
        if(this._isReloading) return
        this._isReloading = true
        this.shootingTime = Date.now()

        if(this.sound.reload_start) this.game.playSound(this.sound.reload_start)
    }

    reloaded() {
        if(this.sound.reload_end) this.game.playSound(this.sound.reload_end)
    }

    setPan(value) {
        value = Number(value)
        for(let sound of this.sound) {
            if(sound.panner){
                sound.panner.pan = value
                sound.panner.setPosition(value, 0, 1 - Math.abs(value))
            }
        }
    }

    shot() {

        if(this._isReloading) {
            this._isReloading = false
            this.shootingTime = Date.now()
            this.ammo = this.maxAmmo - 1

            return
        } else {
            this.ammo --
            if(this.ammo <= 0) {
                this.reload()
            } else {
                this.shootingTime = Date.now()
            }
        }

        if(this.sound.shoot) {
            this.game.playSound(this.sound.shoot)
        }
    }

    readyFraction() {

        if(!this.shootingTime) return 1
        const time = Date.now() - this.shootingTime;

        if(this._isReloading) {
            if(time >= this.reloadTime) {
                this.shootingTime = null
                this._isReloading = false
                this.ammo = this.maxAmmo
                this.reloaded()
                return 1.0
            } else return time / this.reloadTime
        } else {
            if(time >= this.shootRate) {
                this.shootingTime = null
                return 1.0
            } else return time / this.shootRate
        }
    }
}

module.exports = Weapon