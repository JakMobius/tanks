
export default class EventEmitter {

    private handlers: Map<string, Array<(...params: any[]) => any>>[]

    public static PRIORITY_LOW = 3
    public static PRIORITY_MONITOR = 2
    public static PRIORITY_NORMAL = 1
    public static PRIORITY_HIGH = 0

    constructor() {
        this.handlers = []
    }

    addListener(type: string, listener: () => void, priority: number)
    {
        let priorityBlock = this.handlers[priority]

        if(!priorityBlock) {
            priorityBlock = new Map()
            this.handlers[priority] = priorityBlock
        }

        let handlers = priorityBlock.get(type)
        if(handlers) {
            handlers.push(listener)
        } else {
            priorityBlock.set(type, [listener])
        }

        this.emitArgs('newListener', [type, listener]);
    }

    on(type: string, listener: (...params: any[]) => any, priority: number = EventEmitter.PRIORITY_NORMAL){
        return this.addListener(type, listener, priority);
    }

    removeListener(type: string, listener: (...params: any[]) => any) {

        for(let priorityBlock of this.handlers) {
            if(!priorityBlock) continue
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
            for (let priorityBlock of this.handlers) {
                if (type && priorityBlock) {
                    priorityBlock.delete(type)
                }
            }
        } else {
            this.handlers = []
        }
    }


    once(type: string, listener: (...params: any[]) => any) {
        let self = this
        function on() {
            self.removeListener(type, on);
            return listener.apply(this, arguments);
        }
        on.listener = listener;
        return this.on(type, on);
    }

    emitArgs(type: string, args?: any[]) {
        let result = true;

        for(let priorityBlock of this.handlers) {
            if(!priorityBlock) continue
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

        this.emitArgs('event', params);

        return this.emitArgs(type, args) !== false;
    }
}