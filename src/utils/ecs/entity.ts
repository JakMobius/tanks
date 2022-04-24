import {Component} from "./component";
import {Constructor} from "../../serialization/binary/serializable";
import EventEmitter from "../event-emitter";

export default class Entity extends EventEmitter {
    public components: Component[] = []
    public children: Entity[] = []
    public parent: Entity | null

    public addComponent(component: Component): void {
        this.components.push(component)
        component.onAttach(this);
    }

    public getComponent<C extends Component>(ComponentType: Constructor<C> ): C | null {
        for (const component of this.components) {
            if (component instanceof ComponentType) {
                return component as C
            }
        }
        return null
    }

    public removeComponent<C extends Component>(ComponentType: Constructor<C>): void {
        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i]
            if (component instanceof ComponentType) {
                component.onDetach();
                this.components.splice(i, 1)
                break
            }
        }
    }

    public removeAllComponents() {
        while(this.components.length) {
            this.components[this.components.length - 1].onDetach();
            this.components.pop();
        }
    }

    public appendChild(child: Entity) {
        this.children.push(child)
        child.parent = this

        child.propagateEvent("attached-to-parent", child, this)
        this.emit("child-added", child)
    }

    public removeFromParent() {
        if(!this.parent) return
        let index = this.parent.children.indexOf(this)
        if(index == -1) return
        let parent = this.parent
        this.propagateEvent("will-detach-from-parent", this, parent)
        parent.emit("will-remove-child", this)
        this.parent.children.splice(index, 1)
        this.parent = null
        this.propagateEvent("detached-from-parent", this, parent)
        parent.emit("did-remove-child", this)
    }

    public propagateEvent(event: string, ...args: any[]) {
        this.emit(event, ...args);
        for(let child of this.children) {
            child.propagateEvent(event, ...args)
        }
    }
}