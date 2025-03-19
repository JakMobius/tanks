import { EntityDeserializer, EntitySerializer, PrefabFilter, SerializedEntity } from "src/entity/components/inspector/entity-serializer"
import Entity from "src/utils/ecs/entity"

export interface SerializedDanglingEntity extends SerializedEntity {
    cacheId: string,
    children: SerializedDanglingEntity[]
}

export interface CopyBufferValue {
    signature: "TNKS.COPY",
    entities: SerializedEntity[]
    danglingEntities: SerializedDanglingEntity[]
}

export default class CopyManager {

    cache = new Map<string, Entity>()
    invCache = new Map<Entity, string>()

    private getRandomId() {
        return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    }

    clearCache() {
        this.cache.clear()
        this.invCache.clear()
    }

    async copy(entities: Entity[]) {
        let serializer = new EntitySerializer()
        let result = {
            signature: "TNKS.COPY",
            entities: [],
            danglingEntities: []
        } as CopyBufferValue

        for(let entity of entities) {
            result.entities.push(serializer.serializeTree(entity))
        }

        const serializeDanglingEntity = (entity: Entity): SerializedDanglingEntity => {
            let id = this.invCache.get(entity)
            if(!id) {
                id = this.getRandomId()
                this.invCache.set(entity, id)
                this.cache.set(id, entity)
            }

            let serialized = serializer.serializeDangingEntity(entity)

            let children = entity.children.map(() => {
                return serializeDanglingEntity(entity)
            })

            return {
                ...serialized,
                children,
                cacheId: id
            }
        }

        let danglingEntities = serializer.getDanglingEntities()
        for(let entity of danglingEntities) {
            result.danglingEntities.push(serializeDanglingEntity(entity))
        }

        let json = JSON.stringify(result)
        await navigator.clipboard.writeText(json)
    }

    async paste(filter: PrefabFilter): Promise<Entity[]> {
        let json = await navigator.clipboard.readText()
        let data = JSON.parse(json) as CopyBufferValue
        if(data.signature !== "TNKS.COPY") return []

        let deserializer = new EntityDeserializer(filter)
        let result = [] as Entity[]

        const registerDanglingEntity = (entity: SerializedDanglingEntity) => {
            let cacheId = entity.cacheId
            if(this.cache.has(cacheId)) {
                deserializer.ctx.setEntityFor(entity.id, this.cache.get(cacheId)!)
            } else {
                deserializer.createTreeFor(entity, false)
            }
        }

        if(data.danglingEntities) {
            for(let entity of data.danglingEntities) {
                registerDanglingEntity(entity)
            }
        }

        for(let serialized of data.entities) {
            result.push(deserializer.createTreeFor(serialized))
        }

        deserializer.restoreProperties()

        return result
    }
}