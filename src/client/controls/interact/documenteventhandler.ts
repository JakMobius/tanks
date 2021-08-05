
import EventEmitter from '../../../utils/eventemitter';

export default class DocumentEventHandler extends EventEmitter {
	public listeners = new Map<string, () => void>();
	public target: GlobalEventHandlers | GlobalEventHandlers[];
	public keys: any;

    constructor() {
        super()

        this.target = document.body
    }

    bind(event: string, handler: (event: Event) => void) {
        if(this.listeners.has(event)) {
            this.unbind(event)
        }
        const self = this
        const listener = function(){ handler.apply(self, arguments) }


        this.listeners.set(event, listener)

        if(Array.isArray(this.target)) {
            for (let target of this.target)
                target.addEventListener(event, listener)
        } else {
            this.target.addEventListener(event, listener)
        }
    }

    unbind(event: string) {
        if(Array.isArray(this.target)) {
            for (let target of this.target)
                target.removeEventListener(event, this.listeners.get(event))
        } else {
            this.target.removeEventListener(event, this.listeners.get(event))
        }

        this.listeners.delete(event)
    }

    startListening() {}
    stopListening() {
        for(let event of this.listeners.keys()) {
            this.unbind(event)
        }
        this.keys.clear()
        this.listeners.clear()
    }
}