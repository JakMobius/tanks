import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import MapReceiver from "src/entity/components/network/map/map-receiver";
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import PrimaryPlayerReceiver from "src/entity/components/network/primary-player/primary-player-receiver";
import CollisionIgnoreListReceiver from "src/entity/components/network/collisions/collision-ignore-list-receiver";
import ExplodeEntityAffectController from "src/effects/explode/explode-effect-entity-affect-controller";
import Entity from "src/utils/ecs/entity";
import {GameWorldConfig, gameWorldEntityPrefab} from "src/entity/game-world-entity-prefab";
import WorldStatisticsReceiver from "src/entity/components/network/world-statistics/world-statistics-receiver";
import UserMessageReceiver from "src/entity/components/network/event/user-message-receiver";
import CollisionDisableReceiver from "src/entity/components/network/collisions/collision-disable-receiver";
import ExplodeShakingComponent from "src/client/entity/components/explode-pool-shaking-component";

export function clientGameWorldEntityPrefab(entity: Entity, options?: GameWorldConfig) {
    gameWorldEntityPrefab(entity, options)

    entity.addComponent(new EntityDataReceiveComponent(0).makeRoot(true))
    entity.addComponent(new MapReceiver())
    entity.addComponent(new EntityStateReceiver())
    entity.addComponent(new PrimaryPlayerReceiver())
    entity.addComponent(new CollisionIgnoreListReceiver())
    entity.addComponent(new CollisionDisableReceiver())
    entity.addComponent(new WorldStatisticsReceiver())
    entity.addComponent(new UserMessageReceiver())
    entity.addComponent(new ExplodeShakingComponent())
    entity.addComponent(new ExplodeEntityAffectController())
    entity.addComponent(new ParticleHostComponent())
}
