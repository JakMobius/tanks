import WorldExplodeEffectModelPool from "../effects/explode/explode-effect-pool";
import ParticleHostComponent from "./entity/components/particle-host-component";
import EntityDataReceiveComponent from "../entity/components/network/receiving/entity-data-receive-component";
import EffectReceiver from "../entity/components/network/effect/effect-receiver";
import MapReceiver from "../entity/components/network/map/map-receiver";
import EntityStateReceiver from "../entity/components/network/entity/entity-state-receiver";
import PrimaryPlayerReceiver from "../entity/components/network/primary-player/primary-player-receiver";
import CollisionIgnoreListReceiver from "../entity/components/network/collisions/collision-ignore-list-receiver";
import ExplodeEffectEntityAffectController from "../effects/explode/explode-effect-entity-affect-controller";
import Entity from "../utils/ecs/entity";
import {GameWorldConfig, gameWorldEntityPrefab} from "../game-world-entity-prefab";
import WorldStatisticsReceiver from "../entity/components/network/world-statistics/world-statistics-receiver";

export function clientGameWorldEntityPrefab(entity: Entity, options: GameWorldConfig) {
    gameWorldEntityPrefab(entity, options)

    entity.addComponent(new WorldExplodeEffectModelPool())
    entity.addComponent(new ExplodeEffectEntityAffectController())
    entity.addComponent(new ParticleHostComponent())
    entity.addComponent(new EntityDataReceiveComponent())
    entity.addComponent(new EffectReceiver())
    entity.addComponent(new MapReceiver())
    entity.addComponent(new EntityStateReceiver())
    entity.addComponent(new PrimaryPlayerReceiver())
    entity.addComponent(new CollisionIgnoreListReceiver())
    entity.addComponent(new WorldStatisticsReceiver())
}
