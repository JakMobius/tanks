
export default abstract class AbstractEventHandlerSet<T> {
    public listeners = new Map<any, Set<(...params: any[]) => any>>();
    public target: T | T[];

    protected constructor(target?: T | T[]) {
        this.setTarget(target)
    }

    on(event: any, listener: (...params: any[]) => any){
        if(this.listeners.has(event)) {
            this.listeners.get(event).add(listener)
        } else {
            this.listeners.set(event, new Set([listener]))
        }
        if(this.target) this.setEventListeners(event, listener)
    }

    off(event: any, listener: (...params: any[]) => any) {
        if(this.listeners.has(event)) {
            let set = this.listeners.get(event)
            set.delete(listener)
            if(set.size === 0) this.listeners.delete(event)
        }
        if(this.target) this.setEventListeners(event, listener)
    }

    setAllListeners() {
        for(let [event, listeners] of this.listeners) {
            for (let listener of listeners) {
                this.setEventListeners(event, listener)
            }
        }
    }

    resetAllListeners() {
        for(let [event, listeners] of this.listeners) {
            for (let listener of listeners) {
                this.resetEventListeners(event, listener)
            }
        }
    }

    resetAllEventListeners(event: any) {
        let listeners = this.listeners.get(event);
        if(!listeners) return

        for(let listener of listeners) {
            this.resetEventListeners(event, listener)
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

    setEventListeners(event: any, listener: (...params: any[]) => any) {
        if (Array.isArray(this.target)) {
            for (let target of this.target)
                this.setEventListener(target, event, listener)
        } else {
            this.setEventListener(this.target, event, listener)
        }
    }

    protected abstract setEventListener(target: T, event: any, listener: (...params: any[]) => any): void
    protected abstract resetEventListener(target: T, event: any, listener: (...params: any[]) => any): void

    setTarget(target: T | T[]) {
        if(this.target) this.resetAllListeners()
        this.target = target
        if(this.target) this.setAllListeners()
    }
}
