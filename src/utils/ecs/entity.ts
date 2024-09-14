import {Component} from "./component";
import EventEmitter from "../event-emitter";

type ComponentConstructor<T = any> = {
    new (...args: any[]): T
    symbol?: Symbol
}

export default class Entity extends EventEmitter {
    public children: Entity[] = []
    public parent: Entity | null

    public addComponent(component: Component): void {
        let symbol: Symbol = (component.constructor as ComponentConstructor).symbol
        if(!symbol) {
            symbol = Symbol(component.constructor.name);
            (component.constructor as ComponentConstructor).symbol = symbol
        }

        (this as any)[symbol as any] = component
        component.onAttach(this);
    }

    public getComponent<C extends Component>(ComponentType: ComponentConstructor<C>): C | null {
        let symbol: Symbol = (ComponentType).symbol
        if(!symbol) {
            return null
        }

        return (this as any)[symbol as any] as C || null
    }

    public removeComponent<C extends Component>(ComponentType: ComponentConstructor<C>): void {
        let symbol: Symbol = ComponentType.symbol
        if(!symbol) {
            return null
        }

        let component = (this as any)[symbol as any] as C
        (this as any)[symbol as any] = undefined
        component.onDetach()
    }

    public appendChild(child: Entity) {
        this.children.push(child)
        child.parent = this

        child.emit("attached-to-parent", this)
        this.emit("child-added", child)
    }

    public removeFromParent() {
        if(!this.parent) return
        let index = this.parent.children.indexOf(this)
        if(index == -1) return
        let parent = this.parent
        this.emit("will-detach-from-parent", this)
        parent.emit("will-remove-child", this)
        this.parent.children.splice(index, 1)
        this.parent = null
        this.emit("detached-from-parent", this)
        parent.emit("did-remove-child", this)
    }

    public propagateEvent(event: string, ...args: any[]) {
        for(let child of this.children) {
            child.propagateEvent(event, ...args)
        }
        this.emit(event, ...args)
    }
}