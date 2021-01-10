
import Command from '../command';

class RunCommand extends Command {

    onPerform(args: string[]): void {
        if(args.length !== 1) {
            this.console.logger.log("Usage: " + this.getUsage())
            return
        }

        this.console.runScript(args[0], 0)
    }

    getName() {
        return "run"
    }

    getUsage() {
        return "run <script name>"
    }

    requiresRoom() {
        return super.requiresRoom();
    }

    getDescription() {
        return "Run script"
    }
}

export default RunCommand;