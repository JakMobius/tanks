import AbstractEventHandlerSet from "./abstract-event-handler-set";
import EventEmitter from "./eventemitter";

export default class BasicEventHandlerSet extends AbstractEventHandlerSet<EventEmitter> {

    constructor() {
        super()
    }

    protected resetEventListener(target: EventEmitter, event: any, listener: (...params: any[]) => any): void {
        target.off(event, listener)
    }

    protected setEventListener(target: EventEmitter, event: any, listener: (...params: any[]) => any): void {
        target.on(event, listener)
    }

}