import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import ExplodeEntityAffectController from "src/effects/explode/explode-effect-entity-affect-controller";
import Entity from "src/utils/ecs/entity";
import {gameWorldEntityPrefab} from "src/entity/game-world-entity-prefab";
import WorldStatisticsReceiver from "src/entity/components/world-statistics/world-statistics-receiver";
import UserMessageReceiver from "src/entity/components/network/event/user-message-receiver";
import ExplodeShakingComponent from "src/client/entity/components/explode-pool-shaking-component";
import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import ExplodePoolParticleComponent from "./components/explode-pool-particle-component";
import { GameHudListenerComponent } from "../ui/game-hud/game-hud";
import PrimaryPlayerReceiver from "src/entity/components/primary-player/primary-player-receiver";
import CollisionIgnoreListReceiver from "src/entity/components/collisions/collision-ignore-list-receiver";

export function clientGameWorldEntityPrefab(entity: Entity) {
    gameWorldEntityPrefab(entity)

    entity.addComponent(new EntityDataReceiveComponent(0))
    entity.addComponent(new EntityStateReceiver())
    entity.addComponent(new PrimaryPlayerReceiver())
    entity.addComponent(new CollisionIgnoreListReceiver())
    entity.addComponent(new WorldStatisticsReceiver())
    entity.addComponent(new UserMessageReceiver())
    entity.addComponent(new ExplodeShakingComponent())
    entity.addComponent(new ExplodeEntityAffectController())
    entity.addComponent(new ParticleHostComponent())
    entity.addComponent(new ExplodeEffectPool({
        damageBlocks: false
    }))
    entity.addComponent(new ExplodePoolParticleComponent())
    entity.addComponent(new GameHudListenerComponent())
}
