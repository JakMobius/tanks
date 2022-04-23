import WorldExplodeEffectModel from 'src/effects/world/models/world-explode-effect-model';
import ServerEntity from './server-entity';
import BulletModel from "../../entity/bullet-model";
import * as Box2D from 'src/library/box2d'
import PhysicalComponent from "../../entity/components/physics-component";
import TilemapComponent from "../../physics/tilemap-component";
import EffectHost from "../../effects/effect-host";
import HealthComponent from "../../entity/components/health-component";
import ServerEffect from "../effects/server-effect";
import EntityModel from "../../entity/entity-model";

export interface ServerBulletConfig {
    model: BulletModel
}

export default class ServerBullet extends ServerEntity {
    static Model: typeof BulletModel

    constructor(options: ServerBulletConfig) {
        super(options.model);
    }

    static setupEntity(entity: EntityModel) {
        ServerEntity.setupEntity(entity)

        entity.wallDamage = 0
        entity.playerDamage = 0
        entity.explodePower = 0
        entity.startVelocity = 20
        entity.lifeTime = 15

        // entity.on("should-hit-entity", (entity: EntityModel) => {
        //     return entity !== this.shooter
        // })

        entity.on("tick", (dt: number) => {
            entity.lifeTime -= dt
            if(entity.lifeTime <= 0) entity.removeFromParent()
        })

        entity.on("entity-hit", (entity: EntityModel) => {
            const world = entity.parent

            world.physicsLoop.scheduleTask(() => {
                let healthComponent = entity.getComponent(HealthComponent)
                if(healthComponent) healthComponent.damage(entity.playerDamage)
            })
        })

        entity.on("block-hit", (x: number, y: number, point: Box2D.Vec2) => {
            const world = entity.parent

            world.physicsLoop.scheduleTask(() => {
                const mapComponent = world.getComponent(TilemapComponent)
                if(mapComponent) {
                    mapComponent.map.damageBlock(x, y, entity.wallDamage)
                }
            })
        })

        entity.on("block-hit", (x: number, y: number, point: Box2D.Vec2) => {
            let position = entity.getComponent(PhysicalComponent).getBody().GetPosition()
            let effect = new WorldExplodeEffectModel({
                x: position.x,
                y: position.y,
                power: entity.explodePower
            })
            const world = entity.parent

            world.getComponent(EffectHost).addEffect(ServerEffect.fromModel(effect))

            entity.removeFromParent()
        })
    }
}
