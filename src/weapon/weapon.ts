import * as Box2D from '../library/box2d';
import Bullet42mmModel from '../entity/bullet/models/42mm';
import ServerBullet from '../server/entity/bullet/serverbullet';
import Axle from "../tanks/controls/axle";
import ServerTank from "../server/tanks/servertank";
import BulletModel from "../entity/bullet/bulletmodel";

export interface WeaponConfig {
    maxAmmo?: number
    shootRate?: number
    reloadTime?: number
    bulletType?: typeof BulletModel
    tank?: ServerTank
    triggerAxle?: Axle
}

class Weapon {
	public config: WeaponConfig;
	public maxAmmo: number;
	public shootRate: number;
	public reloadTime: number;
	public bulletType: typeof BulletModel;
	public ammo: number;
	public isReloading: boolean;
	public shootingTime: number;
	public id: number

    /**
     * Indicates whether weapon is currently shooting
     */
    engaged: boolean = false

    /**
     * Trigger axle. Weapon will shoot if its value is above 0.5
     */
    triggerAxle: Axle | null = null

    /**
     * Tanks that equipped with this weapon
     */
    tank: ServerTank = null

    constructor(config: WeaponConfig) {
        config = config || {}
        this.config = config
        this.maxAmmo = config.maxAmmo ?? Infinity
        this.shootRate = config.shootRate ?? 2000
        this.reloadTime = config.reloadTime ?? 4000
        this.bulletType = config.bulletType ?? Bullet42mmModel
        this.tank = config.tank
        this.triggerAxle = config.triggerAxle
        this.ammo = this.maxAmmo
        this.isReloading = false
        this.shootingTime = null
        this.engaged = false
    }

    reload(): void {
        if (this.isReloading) return
        this.isReloading = true
        this.shootingTime = Date.now()
    }

    launchBullet(tank: ServerTank, x: number, y: number, rotation?: number): void {
        let sin, cos

        if(rotation === undefined) {
            sin = tank.model.matrix.sin
            cos = tank.model.matrix.cos
            rotation = tank.model.body.GetAngle()
        } else {
            sin = Math.sin(rotation)
            cos = Math.cos(rotation)
        }

        const bullet = new (this.bulletType)(tank.world);
        const entity = ServerBullet.fromModel(bullet)

        entity.shooter = tank.player

        bullet.rotation = rotation
        bullet.x = x
        bullet.y = y
        bullet.dx = -sin * entity.startVelocity
        bullet.dy = cos * entity.startVelocity

        tank.world.createEntity(entity)

        tank.model.body.ApplyLinearImpulse(
            new Box2D.Vec2(
                -bullet.dx * entity.mass,
                -bullet.dy * entity.mass
            ),
            new Box2D.Vec2(
                x, y
            )
        )
    }

    tick() {
        if(!this.triggerAxle) return
        if (this.tank.model.health <= 0) {
            if(this.engaged) {
                this.engaged = false
                this.onDisengage()
            }
        } else if(this.triggerAxle.needsUpdate()) {
            let engaged = this.triggerAxle.getValue() > 0.5

            if (engaged !== this.engaged) {
                this.engaged = engaged
                if (engaged) {
                    this.onEngage()
                } else {
                    this.onDisengage()
                }
            }
        }

        if(this.engaged && this.ready()) {
            this.shoot()
        }
    }

    onEngage() {

    }

    onDisengage() {

    }

    shoot() {
        let position = this.tank.model.body.GetPosition()
        this.launchBullet(this.tank, position.x, position.y)

        this.popBullet()
    }

    popBullet() {
        this.ammo--
        if (this.ammo === 0) {
            this.reload()
        } else {
            this.shootingTime = Date.now()
        }
    }

    ready() {

        if (!this.shootingTime) return true
        const time = Date.now() - this.shootingTime;

        if (this.isReloading) {
            if (time >= this.reloadTime) {
                this.shootingTime = null
                this.isReloading = false
                this.ammo = this.maxAmmo
                return true
            } else return false
        } else {
            return time >= this.shootRate
        }
    }

    getId() {
        return this.id
    }
}

export default Weapon;
