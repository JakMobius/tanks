import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import BasicEventHandlerSet from "src/utils/basic-event-handler-set"
import Entity from "src/utils/ecs/entity"
import EventEmitter from "src/utils/event-emitter"
import PrefabIdComponent from "../prefab-id-component"

export interface SerializedEntity {
    prefab: number
    id: number
    properties: Record<string, any>
    children: SerializedEntity[]
}

export class SerializationContext {
    map = new Map<Entity, number>()
    invMap = new Map<number, Entity>()

    has(entity: Entity) {
        return this.map.has(entity)
    }

    getIdFor(entity: Entity) {
        let id = this.map.get(entity)
        if(id === undefined) {
            id = this.map.size
            this.setEntityFor(id, entity)
        }
        return id
    }

    setEntityFor(id: number, entity: Entity) {
        this.map.set(entity, id)
        this.invMap.set(id, entity)
    }

    getEntityFor(id: number) {
        return this.invMap.get(id)
    }
}

export abstract class Property<T = any> extends EventEmitter {
    eventHandler = new BasicEventHandlerSet()
    value: T
    hidden = false
    serialized = true
    id: string
    name: string | null = null
    getter: () => T = () => this.value
    setter: (value: T) => void = (value) => this.value = value

    shouldUpdate(oldValue: T, newValue: T) {
        return true
    }

    getValue() {
        return this.value = this.getter()
    }

    setValue(value: T) {
        this.setter(value)
        this.emit("set")
    }

    update() {
        let newValue = this.getter()
        if (!this.shouldUpdate(this.value, newValue)) return
        this.value = newValue
        this.emit("change")
    }

    withGetter(getter: () => T) {
        this.getter = getter
        return this
    }

    withSetter(setter: (value: T) => void) {
        this.setter = setter
        return this
    }

    withHidden(hidden: boolean) {
        this.hidden = hidden
        return this
    }

    withSerialized(serialized: boolean) {
        this.serialized = serialized
        return this
    }

    withName(name: string) {
        this.name = name
        return this
    }

    updateOn(event: string) {
        this.eventHandler.on(event, () => this.update())
        return this
    }

    serialize(ctx: SerializationContext): any {
        return this.getValue()
    }

    deserialize(value: any, ctx: SerializationContext) {
        this.setValue(value)
    }
}

export class StringProperty extends Property<string> {
    value: string

    constructor(id: string) {
        super()
        this.id = id
        this.value = ""
    }

    shouldUpdate(oldValue: string, newValue: string): boolean {
        return oldValue !== newValue
    }
}

export class VectorProperty extends Property<number[]> {
    value: number[] = []
    dim: number
    prefixes: string[] = []

    constructor(id: string, dim: number) {
        super()
        this.id = id
        this.dim = dim
        this.value = new Array(dim).fill(0)
    }

    shouldUpdate(oldValue: number[], newValue: number[]): boolean {
        return oldValue.some((coord, i) => coord !== newValue[i])
    }

    withPrefixes(prefixes: string[]) {
        this.prefixes = prefixes
        return this
    }

    requirePositive() {
        let oldSetter = this.setter
        this.setter = (value) => oldSetter(value.map(coord => Math.max(0, coord)))
        return this
    }

    requireInteger() {
        let oldSetter = this.setter
        this.setter = (value) => oldSetter(value.map(coord => Math.floor(coord)))
        return this
    }

    setBounds(min: number, max: number) {
        let oldSetter = this.setter
        this.setter = (value) => oldSetter(value.map(coord => Math.max(min, Math.min(max, coord))))
        return this
    }

    replaceNaN(defaultValue: number = 0) {
        let oldSetter = this.setter
        this.setter = (value) => oldSetter(value.map(coord => isNaN(coord) ? defaultValue : coord))
        return this
    }
}

export class EntityProperty extends Property<Entity> {
    value: Entity

    constructor(id: string) {
        super()
        this.id = id
    }

    shouldUpdate(oldValue: Entity, newValue: Entity): boolean {
        return oldValue !== newValue
    }

    serialize(ctx: SerializationContext) {
        let value = this.getValue()
        if(!value) return null
        return ctx.getIdFor(value)
    }

    deserialize(value: any, ctx: SerializationContext): void {
        if(value === null) {
            this.setValue(null)
        } else {
            this.setValue(ctx.getEntityFor(value))
        }
    }
}

export interface SelectOption {
    name: string
    id: string | number
}

export class SelectProperty extends Property<string> {
    value: string
    options: SelectOption[] = []

    constructor(id: string) {
        super()
        this.id = id
    }

    withOptions(options: SelectOption[]) {
        this.options = options
        return this
    }
}

export class PropertyInspector extends EventEmitter {
    eventHandler = new BasicEventHandlerSet()
    properties: Property[] = []
    entity: Entity

    constructor(entity: Entity) {
        super()
        this.eventHandler.setTarget(entity)
        this.entity = entity
        this.properties = []
        this.refresh()
    }

    refreshOn(event: string) {
        this.eventHandler.on(event, () => this.refresh())
    }

    refresh() {
        for(let property of this.properties) {
            property.eventHandler.setTarget(null)
        }
        this.properties = []
        this.entity.emit("inspector-added", this)
        this.emit("refresh")
    }

    addProperty<T>(property: Property<T>) {
        this.properties.push(property)
        property.eventHandler.setTarget(this.entity)
        property.on("set", () => this.emit("set"))
    }

    cleanup() {
        this.eventHandler.setTarget(null)
        for(let property of this.properties) {
            property.eventHandler.setTarget(null)
        }
    }

    deserializeProperties(properties: Record<string, any>, ctx: SerializationContext) {
        // It's better not to use for-of loop here, since this.properties
        // might get updated during the loop (e.g. if when reading somethingCount
        // from properties, it adds a new property to this.properties)
        for(let i = 0; i < this.properties.length; i++) {
            let property = this.properties[i]
            if(property.serialized && properties.hasOwnProperty(property.id)) {
                property.deserialize(properties[property.id], ctx)
            }
        }
    }

    serializeProperties(ctx: SerializationContext): Record<string, any> {
        let properties = new Object(null) as Record<string, any>
        for(let property of this.properties) {
            if(property.serialized) {
                properties[property.id] = property.serialize(ctx)
            }
        }
        return properties
    }
}

export interface EntityFactory {
    root?: (prefab: number) => Entity,
    leaf?: (prefab: number) => Entity
}

export function manufactureEntity(prefabId: number, factory?: (prefabId: number) => Entity) {
    let entity: Entity
    if(factory) {
        entity = factory(prefabId)
    } else {
        entity = new Entity
    }
    if(entity) {
        ServerEntityPrefabs.types.get(prefabId)?.(entity)
    }
    return entity
}

export class EntityDeserializer {
    map = new Map<Entity, SerializedEntity>()
    ctx = new SerializationContext()
    factory?: EntityFactory

    constructor(factory?: EntityFactory) {
        this.factory = factory
    }

    createTreeFor(serialized: SerializedEntity, root: boolean = true) {
        let entity: Entity

        if(root) {
            entity = manufactureEntity(serialized.prefab, this.factory?.root)
        } else {
            entity = manufactureEntity(serialized.prefab, this.factory?.leaf)
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

        let prefab = entity.getComponent(PrefabIdComponent)?.prefabId
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

    getSerializedDanglingEntities() {
        return Array.from(this.danglingEntities).map(entity => this.serialize(entity))
    }
}