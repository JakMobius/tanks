import Weapon, {WeaponConfig} from "./weapon";
import PhysicalComponent from "../entity/components/physics-component";
import TransformComponent from "../entity/components/transform-component";
import ServerEntityPrefabs from "../server/entity/server-entity-prefabs";
import BulletLauncher from "../server/entity/bullet-launcher";
import CollisionIgnoreList from "../entity/components/collision-ignore-list";
import Entity from "../utils/ecs/entity";
import BulletShootersComponent from "../entity/components/bullet-shooters-component";
import ServerEntityPilotListComponent from "../server/entity/components/server-entity-pilot-list-component";

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

        const entity = new Entity()
        ServerEntityPrefabs.types.get(bullet)(entity)

        entity.addComponent(new BulletLauncher({
            x: transform.transformX(x, y),
            y: transform.transformY(x, y)
        }, tankBody.GetAngle()))

        let shooters = tank.getComponent(ServerEntityPilotListComponent).players
        entity.addComponent(new BulletShootersComponent(shooters))

        CollisionIgnoreList.ignoreCollisions(entity, tank)

        this.tank.emit("bullet-shot", this, entity)

        world.appendChild(entity)

        // TODO:
        // tankBody.ApplyLinearImpulse(
        //     new Box2D.Vec2(-vx * bulletBody.GetMass(), -vy * bulletBody.GetMass()),
        //     new Box2D.Vec2(absoluteX, absoluteY)
        // )
    }
}