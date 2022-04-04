import LoggerDestination from "../log/logger-destination";

export default class CallbackLogger extends LoggerDestination {
    public callback: (line: string) => void;

    constructor(callback: (line: string) => void) {
        super();
        this.callback = callback
    }

    log(value: string) {
        this.callback(value)
    }
}