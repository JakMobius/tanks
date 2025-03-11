import ServerPositionComponent from "./components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import Entity from "src/utils/ecs/entity";
import CollisionDisableComponent from "src/entity/components/collisions/collision-disable";
import CollisionDisableReceiver from "src/entity/components/collisions/collision-disable-receiver";
import HealthReceiver from "src/entity/components/health/health-receiver";
import CollisionIgnoreListReceiver from "src/entity/components/collisions/collision-ignore-list-receiver";

import clientPrefabs from 'src/entity/types/%/client-prefab.ts'
import { EntityPrefab, EntityType } from "src/entity/entity-prefabs";

export default class ClientEntityPrefabs {
    static configureClientEntity(entity: Entity) {
        entity.addComponent(new EntityStateReceiver())
    }

    static configureGameWorldEntity(entity: Entity) {
        this.configureClientEntity(entity)
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new CollisionDisableComponent())
        entity.addComponent(new CollisionDisableReceiver())
        entity.addComponent(new HealthReceiver())
        entity.addComponent(new CollisionIgnoreListReceiver())
    }

    static getByType(type: EntityType): EntityPrefab[] {
        let result = []
        for (let prefab of clientPrefabs) {
            if (prefab.metadata.type == type) {
                result.push(prefab)
            }
        }
        return result
    }

    static getById(id: string) {
        return this.prefabs.get(id)
    }
    
    static prefabs = new Map<string, EntityPrefab>(clientPrefabs.map(prefab => [prefab.id, prefab]))
    static tanks = this.getByType(EntityType.tank)
    static gameModes = this.getByType(EntityType.gameController)
}