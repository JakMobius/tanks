
// noinspection JSUnresolvedVariable
if (typeof window == "undefined") {
    const Events = require("eve" + "nts")

    // noinspection JSDuplicatedDeclaration
    class EventEmitter extends Events {
        constructor() {
            super();
        }

        on(event, handler) {
            this.addListener(event, handler)
        }
    }

    module.exports = EventEmitter
} else {

    // noinspection JSDuplicatedDeclaration
    class EventEmitter {
        constructor() {
            this.events = new Map()
        }

        emit(event) {
            if (this.events.has(event)) {
                let args = Array.prototype.slice.call(arguments, 1)
                for (let listener of this.events.get(event)) {
                    listener.apply(null, args)
                }
            }
        }

        on(event, handler) {
            if (this.events.has(event)) {
                this.events.get(event).push(handler)
            } else {
                this.events.set(event, [handler]);
            }
        }
    }

    module.exports = EventEmitter
}