import WorldExplodeEffectModel from 'src/effects/world/models/world-explode-effect-model';
import ServerWorldEffect from 'src/server/effects/world/server-world-effect';
import ServerEntity from '../server-entity';
import BulletModel from "../../../entity/bullets/bullet-model";
import ServerPlayer from "../../server-player";
import * as Box2D from 'src/library/box2d'
import ServerTank from "../tank/server-tank";
import PhysicalComponent from "../../../entity/components/physics-component";
import TilemapComponent from "../../../physics/tilemap-component";
import EffectHost from "../../../effects/effect-host";
import WriteBuffer from "../../../serialization/binary/write-buffer";
import HealthComponent from "../../../entity/components/health-component";

export interface ServerBulletConfig {
    model: BulletModel
}

export default class ServerBullet extends ServerEntity {
    static Model: typeof BulletModel

	public wallDamage: number;
	public playerDamage: number;
	public explodePower: number;
	public lifeTime: number
	public startVelocity: number;
    public shooter: ServerPlayer = null

    constructor(options: ServerBulletConfig) {
        super(options.model);

        this.wallDamage = 0
        this.playerDamage = 0
        this.explodePower = 0
        this.startVelocity = 20
        this.lifeTime = 15
    }

    tick(dt: number) {
        super.tick(dt)

        this.lifeTime -= dt
        if(this.lifeTime <= 0) this.die()
    }

    die() {
        if(this.model.dead) return
        this.model.dead = true
        if(this.explodePower) {
            let position = this.model.getComponent(PhysicalComponent).getBody().GetPosition()
            let effect = new WorldExplodeEffectModel({
                x: position.x,
                y: position.y,
                power: this.explodePower
            })
            const world = this.shooter.getWorld()

            world.getComponent(EffectHost).addEffect(ServerWorldEffect.fromModelAndWorld(effect, world))
        }
    }

    shouldHitEntity(entity: ServerEntity): boolean {
        return entity !== this.shooter.tank
    }

    onEntityHit(entity: ServerEntity) {
        if(entity == this.shooter.tank) return
        if(entity instanceof ServerTank) {
            const world = this.model.parent

            world.physicsLoop.scheduleTask(() => {
                let healthComponent = entity.model.getComponent(HealthComponent)
                if(healthComponent) healthComponent.damage(this.playerDamage)
            })

        }
        this.die()
    }

    onBlockHit(x: number, y: number, point: Box2D.Vec2) {
        if(this.model.dead) return

        if(this.model.diesAfterWallHit) {
            this.die()
        }
        if(this.wallDamage) {
            const world = this.model.parent

            world.physicsLoop.scheduleTask(() => {
                const mapComponent = world.getComponent(TilemapComponent)
                if(mapComponent) {
                    mapComponent.map.damageBlock(x, y, this.wallDamage)
                }
            })
        }
    }

    // encodeInitialData(encoder: WriteBuffer) {
    //     super.encodeInitialData(encoder);
    //     encoder.writeUint32(this.shooter.id)
    // }
}
