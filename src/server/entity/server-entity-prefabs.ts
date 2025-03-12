import { EntityPrefab, EntityType } from "src/entity/entity-prefabs";
import serverPrefabs from 'src/entity/types/%/server-prefab.ts'

export default class ServerEntityPrefabs {
    static getByType(type: EntityType) {
        let result = []
        for (let prefab of serverPrefabs) {
            if (prefab.metadata.type == type) {
                result.push(prefab)
            }
        }
        return result
    }

    static getById(id: string) {
        return this.prefabs.get(id)
    }
    
    static prefabs = new Map<string, EntityPrefab>(serverPrefabs.map(prefab => [prefab.id, prefab]))
    static tanks = this.getByType(EntityType.tank)
    static gameModes = this.getByType(EntityType.gameController)
}