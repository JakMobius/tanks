import {Constructor} from "src/utils/constructor"
import {Class} from "./class";

export default class TypedEventHandler<Args extends Array<any> = []> {

    listeners = new Map<string | Class<any>, Array<Function>>()

    on<T>(what: Constructor<T>, handler: ((packet: T, ...rest: Args) => void)): void
    on(what: string, handler: ((...args: any[]) => void)): void
    on(what: Constructor<any> | string, handler: Function): void {
        if(this.listeners.has(what)) {
            this.listeners.get(what).push(handler)
        } else {
            this.listeners.set(what, [handler])
        }
    }

    emitArgs(key: Class<any>, args: Args): void
    emitArgs(key: string, args: any[]): void
    emitArgs(key: Class<any> | string, args: any) {
        let listeners = this.listeners.get(key)

        if(listeners) {
            for(let listener of listeners) {
                listener.apply(this, args)
            }
        }
    }

    emit(event: string, ...rest: any[]): void
    emit(event: Object, ...rest: Args): void
    emit(event: string | Object, ...rest: any) {
        if (typeof event == "string") {
            let args = Array.prototype.slice.call(arguments, 1)
            this.emitArgs(event, args)
        } else {
            const constructor = event.constructor as Class<any>
            this.emitArgs(constructor, Array.prototype.slice.call(arguments))
        }
    }
}