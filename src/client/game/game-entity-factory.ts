import Entity from "src/utils/ecs/entity"
import ClientEntityPrefabs from "../entity/client-entity-prefabs"

export const gameEntityFactory = (id: string, entity: Entity) => {
    let prefab = ClientEntityPrefabs.getById(id)
    if(prefab) prefab.prefab(entity)
    else console.error(`Failed to create entity with id ${id}`)
    return entity
}