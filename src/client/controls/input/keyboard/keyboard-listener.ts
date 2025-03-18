import DOMEventHandlerSet from "src/utils/dom-event-handler-set";
import EventEmitter from "src/utils/event-emitter";

export default class KeyboardListener extends EventEmitter {

    handlerSet = new DOMEventHandlerSet()
    keys = new Set()

    constructor() {
        super();

        this.handlerSet.on("keyup", (event) => this.keyup(event))
        this.handlerSet.on("keydown", (event) => this.keydown(event))
    }

    keyup(e: KeyboardEvent) {
        if(e.target instanceof HTMLInputElement && !this.keys.has(e.code)) {
            return
        }

        this.emit("keyup", e)
        this.keys.delete(e.code)
    }

    keydown(e: KeyboardEvent) {
        if(e.target instanceof HTMLInputElement) return
        this.emit("keydown", e)
        this.keys.add(e.code)
    }

    setTarget(target: HTMLElement) {
        if(this.handlerSet.target === target) {
            return
        }

        this.handlerSet.setTarget(target)

        if(this.handlerSet.target && !target) this.emit("stopped-listening")
        if(!this.handlerSet.target && target) this.emit("started-listening")
    }

    clearAxles() {
        this.emit("clear-axles")
    }
}