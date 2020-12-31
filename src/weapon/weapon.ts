import Box2D from '../library/box2d';
import Bullet42mmModel from '../entity/bullet/models/42mm';
import ServerBullet from '../server/entity/bullet/serverbullet';

class Weapon {
	public config: any;
	public maxAmmo: any;
	public shootRate: any;
	public reloadTime: any;
	public bulletType: any;
	public ammo: any;
	public isReloading: any;
	public shootingTime: any;
	public id: any;
    /**
     * Indicates whether weapon is currently shooting
     * @type {boolean}
     */
    engaged = false

    /**
     * Trigger axle. Weapon will shoot if its value is above 0.5
     * @type {Axle}
     */
    triggerAxle = null

    /**
     * Tanks that equipped with this weapon
     * @type {ServerTank}
     */
    tank = null

    constructor(config) {
        config = config || {}
        this.config = config
        this.maxAmmo = config.maxAmmo || Infinity
        this.shootRate = config.shootRate || 2000
        this.reloadTime = config.reloadTime || 4000
        this.bulletType = config.bulletType || Bullet42mmModel
        this.tank = config.tank
        this.triggerAxle = config.triggerAxle
        this.ammo = this.maxAmmo
        this.isReloading = false
        this.shootingTime = null
        this.engaged = false
    }

    reload() {
        if (this.isReloading) return
        this.isReloading = true
        this.shootingTime = Date.now()
    }

    launchBullet(tank, x, y, rotation?) {
        let sin, cos

        if(rotation === undefined) {
            sin = tank.model.matrix.sin
            cos = tank.model.matrix.cos
            rotation = tank.model.body.GetAngle()
        } else {
            sin = Math.sin(rotation)
            cos = Math.cos(rotation)
        }

        const bullet = new (this.bulletType)();
        const entity = ServerBullet.fromModel(bullet)

        entity.shooter = tank.player

        bullet.rotation = rotation
        bullet.x = x
        bullet.y = y
        bullet.dx = -sin * entity.startVelocity
        bullet.dy = cos * entity.startVelocity

        tank.world.createEntity(entity)

        tank.model.body.ApplyImpulse(
            new Box2D.b2Vec2(
                -bullet.dx * entity.mass,
                -bullet.dy * entity.mass
            ),
            new Box2D.b2Vec2(
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
