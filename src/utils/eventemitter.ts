

export default class EventEmitter {
	public events = new Map<string, [(...args: any[]) => void]>();

    constructor() {
        this.events = new Map()
    }

    emit(event: string, ...args: any[]) {
        if (this.events.has(event)) {
            let args = Array.prototype.slice.call(arguments, 1)
            for (let listener of this.events.get(event)) {
                listener.apply(null, args)
            }
        }
    }

    on(event: string, handler: (...args: any[]) => void) {
        if (this.events.has(event)) {
            this.events.get(event).push(handler)
        } else {
            this.events.set(event, [handler]);
        }
    }
}