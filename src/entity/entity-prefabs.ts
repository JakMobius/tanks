import Entity from "../utils/ecs/entity";

export default class EntityPrefabs {
    static Types = new Map<number, (entity: Entity) => void>()
}