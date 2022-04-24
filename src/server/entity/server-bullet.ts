import WorldExplodeEffectModel from 'src/effects/world/models/world-explode-effect-model';
import ServerEntity from './server-entity';
import * as Box2D from 'src/library/box2d'
import PhysicalComponent from "../../entity/components/physics-component";
import TilemapComponent from "../../physics/tilemap-component";
import EffectHost from "../../effects/effect-host";
import HealthComponent from "../../entity/components/health-component";
import ServerEffect from "../effects/server-effect";
import EntityModel from "../../entity/entity-model";

export default class ServerBullet extends ServerEntity {

    static setShooter(entity: EntityModel, shooter: EntityModel) {
        entity.on("should-collide", (body: Box2D.Body) => {
            return body.GetUserData() !== shooter
        })
    }

    static explode(entity: EntityModel) {
        let position = entity.getComponent(PhysicalComponent).getBody().GetPosition()
        let effect = new WorldExplodeEffectModel({
            x: position.x,
            y: position.y,
            power: entity.explodePower
        })
        const world = entity.parent

        world.getComponent(EffectHost).addEffect(ServerEffect.fromModel(effect))
    }

    static setupEntity(entity: EntityModel) {
        ServerEntity.setupEntity(entity)

        entity.wallDamage = 0
        entity.playerDamage = 0
        entity.explodePower = 0
        entity.startVelocity = 20
        entity.lifeTime = 15

        entity.on("tick", (dt: number) => {
            entity.lifeTime -= dt
            if(entity.lifeTime <= 0) entity.die()
        })

        entity.on("entity-hit", (hitEntity: EntityModel) => {
            if(entity.isDead()) return;
            const world = entity.parent

            world.physicsLoop.scheduleTask(() => {
                let healthComponent = hitEntity.getComponent(HealthComponent)
                if(healthComponent) healthComponent.damage(entity.playerDamage)
            })

            this.explode(entity)
            entity.die();
        })

        entity.on("block-hit", (x: number, y: number, point: Box2D.Vec2) => {
            if(entity.isDead()) return;
            const world = entity.parent

            world.physicsLoop.scheduleTask(() => {
                const mapComponent = world.getComponent(TilemapComponent)
                if(mapComponent) {
                    mapComponent.map.damageBlock(x, y, entity.wallDamage)
                }
            })

            this.explode(entity)
            entity.die();
        })
    }
}
