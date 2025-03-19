import { EntityPrefab } from "src/entity/entity-prefabs"
import Entity from "src/utils/ecs/entity"
import { PropertyInspector, SerializationContext } from "./property-inspector"
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import PrefabComponent from "../prefab-id-component"

export interface SerializedEntity {
    prefab: string
    id: number
    properties: Record<string, any>
    children: SerializedEntity[]
}

export interface PrefabFilter {
    root?: (prefab: EntityPrefab) => Entity,
    leaf?: (prefab: EntityPrefab) => Entity
}

export function manufactureEntity(prefab: EntityPrefab, factory?: (prefab: EntityPrefab) => Entity) {
    let entity: Entity
    if(factory) {
        entity = factory(prefab)
    } else {
        entity = new Entity
    }
    if(entity) {
        prefab?.prefab(entity)
    }
    return entity
}

export class EntityDeserializer {
    map = new Map<Entity, SerializedEntity>()
    ctx = new SerializationContext()
    filter?: PrefabFilter

    constructor(filter?: PrefabFilter) {
        this.filter = filter
    }

    createTreeFor(serialized: SerializedEntity, root: boolean = true) {
        let entity: Entity
        let prefab = ServerEntityPrefabs.getById(serialized.prefab)

        if(!prefab) return null

        if(root) {
            entity = manufactureEntity(prefab, this.filter?.root)
        } else {
            entity = manufactureEntity(prefab, this.filter?.leaf)
        }

        if(!entity) return null

        this.map.set(entity, serialized)
        this.ctx.setEntityFor(serialized.id, entity)

        for(let child of serialized.children) {
            let subtree = this.createTreeFor(child, false)
            if(subtree) {
                entity.appendChild(subtree)
            }
        }

        return entity
    }

    restoreProperties() {
        for(let [entity, serialized] of this.map.entries()) {
            let inspector = new PropertyInspector(entity)
            inspector.deserializeProperties(serialized.properties, this.ctx)
            inspector.cleanup()
        }
    }
}

export class EntitySerializer {
    ctx = new SerializationContext()
    result = new Map<Entity, SerializedEntity>()
    danglingEntities = new Set<Entity>()

    private serialize(entity: Entity): SerializedEntity {
        // This might get called multiple times if there is a complex
        // structure of inter-referencing dangling entities. 

        let cachedResult = this.result.get(entity)
        if(cachedResult) return cachedResult

        let prefab = entity.getComponent(PrefabComponent)?.prefab.id
        let id = this.ctx.getIdFor(entity)
        let children = entity.children.map(child => {
            // Only the root entity can be dangling. All the children
            // are referenced by the root entity, even if it itself is dangling.
            this.danglingEntities.delete(child)
            return this.serialize(child)
        })

        let inspector = new PropertyInspector(entity)
        let properties = inspector.serializeProperties(this.ctx)
        inspector.cleanup()
        
        let result = { prefab, id, properties, children }
        this.result.set(entity, result)

        return result
    }

    serializeTree(entity: Entity) {
        let root = this.serialize(entity)

        let changed = true
        while(changed) {
            changed = false
            for(let [_, entity] of this.ctx.invMap.entries()) {
                if(!this.result.has(entity)) {
                    changed = true
                    this.danglingEntities.add(entity)
                    this.serialize(entity)
                }
            }
        }

        return root
    }

    serializeDangingEntity(entity: Entity) {
        return this.serialize(entity)
    }

    getDanglingEntities() {
        return this.danglingEntities
    }

    getSerializedDanglingEntities() {
        return Array.from(this.danglingEntities).map(entity => this.serialize(entity))
    }
}