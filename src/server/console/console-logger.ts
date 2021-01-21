import LoggerDestination from "../log/logger-destination";
import ConsoleWindow from "./console-window";

export default class ConsoleLogger extends LoggerDestination {
    public window: ConsoleWindow;

    constructor(window: ConsoleWindow) {
        super();
        this.window = window
    }

    log(value: string) {
        this.window.write(value)
    }
}