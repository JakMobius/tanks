import LoggerDestination from "../log/logger-destination";
import BlessedConsoleWindow from "./blessed-console-window";

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