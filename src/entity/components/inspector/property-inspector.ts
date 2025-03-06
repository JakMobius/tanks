import BasicEventHandlerSet from "src/utils/basic-event-handler-set"
import Entity from "src/utils/ecs/entity"
import EventEmitter from "src/utils/event-emitter"
import PrefabIdComponent from "../prefab-id-component"
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"

export abstract class Property<T = any> extends EventEmitter {
    eventHandler = new BasicEventHandlerSet()
    value: T
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
        this.update()
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

    withName(name: string) {
        this.name = name
        return this
    }

    updateOn(event: string) {
        this.eventHandler.on(event, () => this.update())
        return this
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

export interface SerializedEntityProperties {
    prefab: number | null
    properties: Record<string, any>
}

export class PropertyInspector extends EventEmitter {
    properties: Property[] = []
    entity: Entity

    constructor(entity: Entity) {
        super()
        this.entity = entity
        this.entity.emit("inspector-added", this)
    }

    addProperty<T>(property: Property<T>) {
        this.properties.push(property)
        property.eventHandler.setTarget(this.entity)
        property.on("set", () => this.emit("set"))
    }

    cleanup() {
        for(let property of this.properties) {
            property.eventHandler.setTarget(null)
        }
    }

    private restoreProperties(properties: Record<string, any>) {
        for(let property of this.properties) {
            if(properties.hasOwnProperty(property.id)) {
                property.setValue(properties[property.id])
            }
        }
    }

    static deserialize(serialized: SerializedEntityProperties): Entity {
        let entity = new Entity()
        let prefab = ServerEntityPrefabs.types.get(serialized.prefab)
        if(!prefab) return entity
        prefab(entity)
        let inspector = new PropertyInspector(entity)
        inspector.restoreProperties(serialized.properties)
        return entity
    }

    serialize(): SerializedEntityProperties {
        let properties = new Object(null) as Record<string, any>
        for(let property of this.properties) {
            properties[property.id] = property.getValue()
        }
        let prefab = this.entity.getComponent(PrefabIdComponent)?.prefabId

        return {
            prefab, properties
        }
    }
}