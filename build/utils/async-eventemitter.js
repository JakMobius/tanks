
const util = require("util")

 class AsyncEventEmitter {

    static PRIORITY_LOW = 3
    static PRIORITY_MONITOR = 2
    static PRIORITY_NORMAL = 1
    static PRIORITY_HIGH = 0

    constructor() {
        this.handlers = []
    }

    on(type, listener, priority){
        if(priority === undefined) priority = AsyncEventEmitter.PRIORITY_NORMAL
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
    }

    off(type, listener) {
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

    async _emit(type, args) {
        let result = true;

        for(let priorityBlock of this.handlers) {
            if(!priorityBlock) continue
            let handlers = priorityBlock.get(type)
            if(!handlers) continue
            for(let handler of handlers) {
                if(util.types.isAsyncFunction(handler)) {
                    if (await handler.apply(this, args) === false) {
                        result = false;
                    }
                }
                if (handler.apply(this, args) === false) {
                    result = false;
                }
            }
        }

        return result
    }

    async emit(type) {
        let args = Array.prototype.slice.call(arguments, 1)
        let params = Array.prototype.slice.call(arguments)

        return await this._emit(type, args) !== false;
    }
}


module.exports = AsyncEventEmitter