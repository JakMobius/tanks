import clientPrefabs from 'src/entity/types/%/client-prefab.ts'
import { EntityType } from "src/entity/entity-prefabs";
import ClientEntityPrefab from "./client-entity-prefab";

export default class ClientEntityPrefabs {

    static getByType(type: EntityType): ClientEntityPrefab[] {
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
    
    static prefabs = new Map<string, ClientEntityPrefab>(clientPrefabs.map(prefab => [prefab.id, prefab]))
    static tanks = this.getByType(EntityType.tank)
    static gameModes = this.getByType(EntityType.gameController)
}