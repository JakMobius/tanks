
export default class EventEmitter {

    private handlers: Map<number, Map<string, Array<(...params: any[]) => any>>>

    public static PRIORITY_LOW = 3
    public static PRIORITY_MONITOR = 2
    public static PRIORITY_NORMAL = 1
    public static PRIORITY_HIGH = 0

    constructor() {
        this.handlers = new Map()
    }

    addListener(type: string, listener: () => void, priority: number)
    {
        let priorityBlock = this.handlers.get(priority)

        if(!priorityBlock) {
            priorityBlock = new Map()
            this.handlers.set(priority, priorityBlock)
        }

        let handlers = priorityBlock.get(type)
        if(handlers) {
            handlers.push(listener)
        } else {
            priorityBlock.set(type, [listener])
        }

        this._emit('newListener', [type, listener]);
    }

    on(type: string, listener: (...params: any[]) => any, priority: number = EventEmitter.PRIORITY_NORMAL){
        return this.addListener(type, listener, priority);
    }

    removeListener(type: string, listener: (...params: any[]) => any) {

        for(let [_, priorityBlock] of this.handlers.entries()) {
            let handlers = priorityBlock.get(type)
            if(!handlers) continue
            let index = handlers.indexOf(listener)
            if(index !== -1) {
                handlers.splice(index, 1)
            }
        }
    }

    off(type: string, listener: (...params: any[]) => any) {
        return this.removeListener(type, listener)
    }

    removeAllListeners(): void
    removeAllListeners(type?: string): void {
        if(type) {
            for (let [_, priorityBlock] of this.handlers.entries()) {
                if (type) {
                    priorityBlock.delete(type)
                }
            }
        } else {
            this.handlers.clear()
        }
    }


    once(type: string, listener: (...params: any[]) => any) {
        function on() {
            this.removeListener(type, on);
            return listener.apply(this, arguments);
        }
        on.listener = listener;
        return this.on(type, on);
    }

    _emit(type: string, args?: any[]) {
        let result = true;

        for(let [_, priorityBlock] of this.handlers.entries()) {
            let handlers = priorityBlock.get(type)
            if(!handlers) continue
            for(let handler of handlers) {
                if (handler.apply(this, args) === false) {
                    result = false;
                }
            }
        }

        return result
    }

    emit(type: string, ...values: any[]) {
        let args = Array.prototype.slice.call(arguments, 1)
        let params = Array.prototype.slice.call(arguments)

        this._emit('event', params);

        return this._emit(type, args) !== false;
    }
}
