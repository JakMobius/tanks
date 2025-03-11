import ServerWeaponComponent from "src/entity/components/weapon/server-weapon-component";
import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import CollisionIgnoreList from "src/entity/components/collisions/collision-ignore-list";
import Entity from "src/utils/ecs/entity";
import BulletShooterComponent from "src/entity/components/bullet-shooter-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import {EntityType} from "src/entity/entity-type";
import SoundEffectComponent from "src/entity/types/effect-sound/sound-effect-component";
import TimerComponent from "src/entity/types/timer/timer-component";

export default class FirearmWeaponComponent extends ServerWeaponComponent {
    public maxAmmo: number = Infinity
    public shootRate: number = 2
    public currentAmmo: number = 0
    public reloadTime: number = 4
    public isReloading: boolean = false
    public initialBulletVelocity: number = 0
    private soundEntity: Entity | null = null
    private fireSound: number | null = null

    constructor() {
        super();

        this.eventHandler.on("timer-finished", () => {
            this.onTimerFinished()
        })

        this.eventHandler.on("tank-set", (tank) => {
            this.soundEntity.removeFromParent()
            if (tank) {
                tank.appendChild(this.soundEntity)
            }
        })

        this.soundEntity = new Entity()
        ServerEntityPrefabs.types.get(EntityType.EFFECT_SOUND_EFFECT)(this.soundEntity)

        this.updateState()
    }

    tick(dt: number) {
        super.tick(dt);

        if (this.currentAmmo === 0 && !this.isReloading) {
            this.reload()
        }

        if (this.engaged && this.ready()) {
            this.shoot()
        }
    }

    updateState() {
        this.entity?.getComponent(WeaponComponent).setState({
            maxAmmo: this.maxAmmo,
            currentAmmo: this.currentAmmo,
            isReloading: this.isReloading
        })
    }

    setMaxAmmo(maxAmmo: number) {
        this.maxAmmo = maxAmmo
        this.updateState()
        return this
    }

    setShootRate(shootRate: number) {
        this.shootRate = shootRate
        this.updateState()
        return this
    }

    setReloadTime(reloadTime: number) {
        this.reloadTime = reloadTime
        this.updateState()
        return this
    }

    setInitialBulletVelocity(velocity: number) {
        this.initialBulletVelocity = velocity
        return this
    }

    onTimerFinished() {
        if (this.isReloading) {
            this.currentAmmo = this.maxAmmo
            this.isReloading = false
            this.updateState()
        }
    }

    reload(): void {
        if (!this.isReloading) {
            this.isReloading = true
            this.setShootDelay(this.reloadTime)
            this.updateState()
        }
    }

    popBullet() {
        this.currentAmmo--
        if (this.currentAmmo === 0) {
            this.reload()
        } else {
            this.setShootDelay(this.shootRate)
            this.updateState()
        }
    }

    setShootDelay(delay: number) {
        let timerComponent = this.entity.getComponent(TimerComponent)
        timerComponent.countdownFrom(delay)
    }

    ready() {
        if (this.currentAmmo === 0) return false
        let timerComponent = this.entity.getComponent(TimerComponent)
        return timerComponent.currentTime <= 0
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);
        this.updateState()
    }

    shoot() {
        const tank = this.entity.getComponent(WeaponComponent)?.tank
        const position = tank?.getComponent(TransformComponent)?.getPosition()
        if (position) this.playShootSound(position.x, position.y)
    }

    playShootSound(x: number, y: number) {
        if (this.fireSound !== null) {
            this.soundEntity.getComponent(SoundEffectComponent).playSound(x, y, this.fireSound)
        }
    }

    /**
     * Launches a bullet with given tank-space coordinates
     * @param bullet Bullet to launch
     * @param x Initial bullet X coordinate relative to the tank
     * @param y Initial bullet X coordinate relative to the tank
     */

    launchBullet(bullet: number, x: number, y: number): Entity {
        const weaponComponent = this.entity.getComponent(WeaponComponent)
        const tank = weaponComponent.tank
        const tankPhysicalComponent = tank.getComponent(PhysicalComponent)
        const tankBody = tankPhysicalComponent.getBody()
        const tankVelocity = tankBody.GetLinearVelocity()
        const transformComponent = tank.getComponent(TransformComponent)
        const transform = transformComponent.getGlobalTransform()

        const world = tank.parent

        const entity = new Entity()
        ServerEntityPrefabs.types.get(bullet)(entity)

        let worldX = transform.transformX(x, y)
        let worldY = transform.transformY(x, y)

        entity.once("physical-body-created", (component: PhysicalComponent) => {
            let direction = transformComponent.getGlobalDirection()

            let vx = direction.x * this.initialBulletVelocity + tankVelocity.x
            let vy = direction.y * this.initialBulletVelocity + tankVelocity.y

            component.setVelocity({ x: vx, y: vy })

            tankBody.ApplyLinearImpulse(
                {x: -vx * component.body.GetMass(), y: -vy * component.body.GetMass()},
                {x: worldX, y: worldY}
            )
        })

        let shooter = tank.getComponent(ServerEntityPilotComponent).pilot
        entity.addComponent(new BulletShooterComponent(shooter))

        CollisionIgnoreList.ignoreCollisions(entity, tank)

        world.appendChild(entity)

        entity.getComponent(TransformComponent).setGlobal({
            position: {
                x: worldX,
                y: worldY
            },
            angle: transformComponent.getGlobalAngle()
        })

        return entity
    }

    setFireSound(sound: number) {
        this.fireSound = sound
        return this
    }
}