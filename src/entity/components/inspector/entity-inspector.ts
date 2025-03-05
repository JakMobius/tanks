import BasicEventHandlerSet from "src/utils/basic-event-handler-set"
import Entity from "src/utils/ecs/entity"
import EventEmitter from "src/utils/event-emitter"

export abstract class Parameter<T = any> extends EventEmitter {
    eventHandler = new BasicEventHandlerSet()
    value: T
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

export class VectorParameter extends Parameter<number[]> {
    value: number[] = []
    dim: number
    prefixes: string[] = []

    constructor(dim: number) {
        super()
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

export class ParameterInspector extends EventEmitter {
    parameters: Parameter[] = []
    entity: Entity

    constructor(entity: Entity) {
        super()
        this.entity = entity
    }

    addParameter<T>(parameter: Parameter<T>) {
        this.parameters.push(parameter)
        parameter.eventHandler.setTarget(this.entity)
        parameter.on("set", () => this.emit("set"))
    }

    cleanup() {
        for(let parameter of this.parameters) {
            parameter.eventHandler.setTarget(null)
        }
    }
}