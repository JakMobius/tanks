import AbstractEventHandlerSet from "./abstract-event-handler-set";
import EventEmitter from "./event-emitter";

export default class DOMEventHandlerSet extends AbstractEventHandlerSet<HTMLElement> {

    constructor() {
        super();
    }

    protected resetEventListener(target: HTMLElement, event: any, listener: (...params: any[]) => any): void {
        target.removeEventListener(event, listener)
    }

    protected setEventListener(target: HTMLElement, event: any, listener: (...params: any[]) => any, priority: number): void {
        target.addEventListener(event, listener)
    }

}