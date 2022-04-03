import {Component} from "./component";
import {Constructor} from "../../serialization/binary/serializable";
import EventEmitter from "../event-emitter";

export default class Entity extends EventEmitter {
    public components: Component[] = []

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

    public destroy() {
        while(this.components.length) {
            this.components[this.components.length - 1].onDetach();
            this.components.pop();
        }
    }
}