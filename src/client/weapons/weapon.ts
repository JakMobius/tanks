import BulletModel from "../../entity/bullet/bulletmodel";
import ClientGameWorld from "../clientgameworld";

export interface WeaponConfig {
    name: string
    maxAmmo?: number
    reloadTime?: number
    bulletType?: typeof BulletModel
    shootRate?: number,
    sound?: number
    game: ClientGameWorld
}

class Weapon {
	public config: any;
	public name: any;
	public maxAmmo: any;
	public shootRate: any;
	public reloadTime: any;
	public bulletType: any;
	public ammo: any;
	public _isReloading: any;
	public shootingTime: any;
	public sound: any;
	public game: any;

    constructor(config: WeaponConfig) {
        this.config = config
        this.name = config.name || "Weapon"
        this.maxAmmo = config.maxAmmo || Infinity
        this.shootRate = config.shootRate || 200
        this.reloadTime = config.reloadTime || 4.0
        this.bulletType = config.bulletType
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

    setPan(value: number) {
        value = Number(value)
        for(let sound of this.sound) {
            if(sound.panner){
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

export default Weapon;