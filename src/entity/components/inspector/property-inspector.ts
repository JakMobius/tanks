import HistoryManager, { Modification } from "src/client/map-editor/history/history-manager"
import BasicEventHandlerSet from "src/utils/basic-event-handler-set"
import Entity from "src/utils/ecs/entity"
import EventEmitter from "src/utils/event-emitter"

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

export default class PropertyModification implements Modification {
    actionName: string
    oldValue: any
    newValue: any
    property: Property
    entity: Entity

    constructor(entity: Entity, property: Property, value: any) {
        this.entity = entity
        this.oldValue = property.getValue()
        this.newValue = value
        this.property = property
        this.actionName = `Изменение ${property.name}`
    }

    perform() {
        // Use setter instead of setValue because setValue would trigger will-set
        // event, thus registering another unwanted modification in the history
        this.property.setter(this.newValue)
        this.entity.emit("request-focus-self")
    }

    revert() {
        // Same as above
        this.property.setter(this.oldValue)
        this.entity.emit("request-focus-self")
    }
}

export abstract class Property<T = any> extends EventEmitter {
    eventHandler = new BasicEventHandlerSet()
    hidden = false
    serialized = true
    id: string
    name: string | null = null

    getter?: () => T
    setter?: (value: T) => void
    modificationCallback?: (historyManager: HistoryManager, entity: Entity, value: T) => void

    getValue() {
        return this.getter()
    }

    filterUpdate(value: T) {
        return false
    }

    setValue(value: T) {
        if(this.filterUpdate(value)) return
        this.emit("will-set", value)
        this.setter(value)
    }

    update() {
        this.emit("update")
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

    withModificationCallback(modificationCallback: (historyManager: HistoryManager, entity: Entity, value: T) => void) {
        this.modificationCallback = modificationCallback
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

    registerModification(historyManager: HistoryManager, entity: Entity, value: T) {
        if(this.modificationCallback) {
            this.modificationCallback(historyManager, entity, value)
        } else {
            let modification = new PropertyModification(entity, this, value)
            historyManager.registerModification(modification)
        }
    }
}

export class StringProperty extends Property<string> {
    constructor(id: string) {
        super()
        this.id = id
    }

    filterUpdate(value: string) {
        return value === this.getter()
    }
}

export class VectorProperty extends Property<number[]> {
    dim: number
    prefixes: string[] = []

    constructor(id: string, dim: number) {
        super()
        this.id = id
        this.dim = dim
    }

    filterUpdate(value: number[]) {
        let original = this.getter()
        return value.every((coord, i) => coord === original[i])
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

    filterUpdate(value: Entity): boolean {
        return value === this.getter()
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

    filterUpdate(value: string) {
        return value === this.getter()
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
        property.on("will-set", (value) => this.emit("will-set", property, value))
        property.on("update", (value) => this.emit("update", property))
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