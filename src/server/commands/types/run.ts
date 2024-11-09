import Command from '../command';
import {ConsoleAutocompleteOptions} from "src/server/console/console";
import path from "path";

export default class RunCommand extends Command {

    onPerform(args: string[]): void {
        if(args.length !== 1) {
            this.console.logger.log("Usage: " + this.getUsage())
            return
        }

        this.console.runScript(args[0], 0)
    }

    onTabComplete(args: string[], options: ConsoleAutocompleteOptions) {
        let resourcePath = this.console.server.getResourcePath("scripts")
        return this.autocompletePath(args[args.length - 1], resourcePath, ".script", options)
    }

    getName() {
        return "run"
    }

    getUsage() {
        return "run <script name>"
    }

    getDescription() {
        return "Run script"
    }
}