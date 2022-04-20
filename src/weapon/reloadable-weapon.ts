import Weapon, {WeaponConfig} from "./weapon";
import BulletModel from "../entity/bullets/bullet-model";
import ServerBullet from "../server/entity/bullet/server-bullet";
import * as Box2D from "../library/box2d";
import PhysicalComponent from "../entity/components/physics-component";
import PhysicalHostComponent from "../physiсal-world-component";
import TransformComponent from "../entity/components/transform-component";

export interface ReloadableWeaponConfig extends WeaponConfig {
    maxAmmo?: number
    shootRate?: number
    reloadTime?: number
    bulletType?: typeof BulletModel
}

export default class ReloadableWeapon extends Weapon {
    public maxAmmo: number;
    public shootRate: number;
    public reloadTime: number;
    public ammo: number;
    public isReloading: boolean;
    public shootingTime: number;

    constructor(config: ReloadableWeaponConfig) {
        super(config);

        config = Object.assign({
            maxAmmo: Infinity,
            shootRate: 2000,
            reloadTime: 4000,
        }, config)

        this.maxAmmo = config.maxAmmo
        this.shootRate = config.shootRate
        this.reloadTime = config.reloadTime
    }

    tick(dt: number) {
        super.tick(dt);

        if(this.engaged && this.ready()) {
            this.shoot()
        }
    }

    reload(): void {
        if (this.isReloading) return
        this.isReloading = true
        this.shootingTime = Date.now()
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

    shoot() {

    }

    /**
     * Launches a bullet with given tank-space coordinates
     * @param bullet Bullet to launch
     * @param x Initial bullet X coordinate relative to the tank
     * @param y Initial bullet X coordinate relative to the tank
     * @param rotation Initial bullet rotation relative to the tank
     */

    launchBullet(bullet: BulletModel, x: number, y: number, rotation: number = 0): void {

        const tank = this.tank
        const tankBody = tank.model.getComponent(PhysicalComponent).getBody()
        const transform = tank.model.getComponent(TransformComponent).transform

        rotation = tankBody.GetAngle()

        const absoluteX = transform.transformX(x, y)
        const absoluteY = transform.transformY(x, y)

        const sin = Math.sin(rotation)
        const cos = Math.cos(rotation)

        const world = tank.player.getWorld()

        const entity = ServerBullet.fromModel(bullet) as ServerBullet

        entity.shooter = tank.player
        entity.model.initPhysics(world.getComponent(PhysicalHostComponent))

        const bulletBody = bullet.getComponent(PhysicalComponent).getBody()

        let vx = -sin * entity.startVelocity
        let vy = cos * entity.startVelocity

        bulletBody.SetAngle(rotation)
        bulletBody.SetPosition(bulletBody.GetPosition().Set(absoluteX, absoluteY))
        bulletBody.SetLinearVelocity(bulletBody.GetLinearVelocity().Set(vx, vy))

        // TODO: костыль. Этим должен заниматься физ.движок
        tankBody.ApplyLinearImpulse(
            new Box2D.Vec2(-vx * bulletBody.GetMass(), -vy * bulletBody.GetMass()),
            new Box2D.Vec2(absoluteX, absoluteY)
        )

        world.createEntity(entity)
    }
}