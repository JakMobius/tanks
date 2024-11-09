import EventEmitter from "./event-emitter";

export interface PrioritizedHandler {
    handler: (...params: any[]) => any
    priority: number
}

export default abstract class AbstractEventHandlerSet<T> {
    public listeners = new Map<any, Array<PrioritizedHandler>>();
    public target: T | T[];

    protected constructor(target?: T | T[]) {
        this.setTarget(target)
    }

    on(event: any, listener: (...params: any[]) => any, priority: number = EventEmitter.PRIORITY_NORMAL) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).push({
                handler: listener,
                priority: priority
            })
        } else {
            this.listeners.set(event, [{
                handler: listener,
                priority: priority
            }])
        }
        if (this.target) this.setEventListeners(event, listener)
    }

    setAllListeners() {
        for (let [event, listeners] of this.listeners) {
            for (let listener of listeners) {
                this.setEventListeners(event, listener.handler, listener.priority)
            }
        }
    }

    resetAllListeners() {
        for (let [event, listeners] of this.listeners) {
            for (let listener of listeners) {
                this.resetEventListeners(event, listener.handler)
            }
        }
    }

    resetAllEventListeners(event: any) {
        let listeners = this.listeners.get(event);
        if (!listeners) return

        for (let listener of listeners) {
            this.resetEventListeners(event, listener.handler)
        }
    }

    resetEventListeners(event: any, listener: (...params: any[]) => any) {
        if (Array.isArray(this.target)) {
            for (let target of this.target)
                this.resetEventListener(target, event, listener)
        } else {
            this.resetEventListener(this.target, event, listener)
        }
    }

    setEventListeners(event: any, listener: (...params: any[]) => any, priority: number = EventEmitter.PRIORITY_NORMAL) {
        if (Array.isArray(this.target)) {
            for (let target of this.target)
                this.setEventListener(target, event, listener, priority)
        } else {
            this.setEventListener(this.target, event, listener, priority)
        }
    }

    protected abstract setEventListener(target: T, event: any, listener: (...params: any[]) => any, priority: number): void

    protected abstract resetEventListener(target: T, event: any, listener: (...params: any[]) => any): void

    setTarget(target: T | T[]) {
        if (this.target === target) {
            return
        }
        if (this.target) this.resetAllListeners()
        this.target = target
        if (this.target) this.setAllListeners()
    }
}
