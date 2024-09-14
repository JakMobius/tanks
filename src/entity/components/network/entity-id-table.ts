import Entity from "src/utils/ecs/entity";

export default class EntityIdTable {
    table = new Map<number, Entity>
    usedIndices = 0

    getNewId(entity: Entity) {
        let id = this.usedIndices++
        this.table.set(id, entity)
        return id
    }

    getEntityFor(id: number) {
        return this.table.get(id)
    }

    removeId(id: number) {
        this.table.delete(id)
    }

    setEntityId(entity: Entity, id: number) {
        this.table.set(id, entity)
    }
}