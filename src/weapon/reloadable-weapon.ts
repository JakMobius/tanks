import Weapon, {WeaponConfig} from "./weapon";
import PhysicalComponent from "../entity/components/physics-component";
import TransformComponent from "../entity/components/transform-component";
import EntityModel from "../entity/entity-model";
import ServerEntity from "../server/entity/server-entity";
import ServerBullet from "../server/entity/server-bullet";
import BulletLauncher from "../server/entity/bullet-launcher";
import * as Box2D from "../library/box2d"
import BulletBehaviour from "../server/entity/bullet-behaviour";
import CollisionIgnoreList from "../entity/components/collision-ignore-list";

export interface ReloadableWeaponConfig extends WeaponConfig {
    maxAmmo?: number
    shootRate?: number
    reloadTime?: number
    bulletType?: number
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

    launchBullet(bullet: number, x: number, y: number, rotation: number = 0): void {

        const tank = this.tank
        const tankBody = tank.getComponent(PhysicalComponent).getBody()
        const transform = tank.getComponent(TransformComponent).transform

        const world = tank.parent

        const entity = new EntityModel()
        ServerEntity.types.get(bullet)(entity)

        entity.addComponent(new BulletLauncher({
            x: transform.transformX(x, y),
            y: transform.transformY(x, y)
        }, tankBody.GetAngle()))

        CollisionIgnoreList.ignoreCollisions(entity, tank)

        world.appendChild(entity)

        // tankBody.ApplyLinearImpulse(
        //     new Box2D.Vec2(-vx * bulletBody.GetMass(), -vy * bulletBody.GetMass()),
        //     new Box2D.Vec2(absoluteX, absoluteY)
        // )
    }
}