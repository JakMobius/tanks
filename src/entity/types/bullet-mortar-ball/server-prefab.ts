import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import BulletBehaviour from "src/server/entity/bullet-behaviour";
import { EntityPrefab } from "src/entity/entity-prefabs";
import MortarBallBulletBehaviour from "src/entity/types/bullet-mortar-ball/mortar-ball-bullet-behaviour";
import BasePrefab from "./prefab"

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new BulletBehaviour({
            explodePower: 4,
            wallDamage: 500,
            entityDamage: 0.5
        }))
    
        entity.addComponent(new MortarBallBulletBehaviour())
    }
})

export default ServerPrefab;