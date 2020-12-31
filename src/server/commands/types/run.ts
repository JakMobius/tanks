
import Command from '../command';

class RunCommand extends Command {

    onPerform(args) {
        if(args.length !== 1) {
            this.console.logger.log("Использование: " + this.getUsage())
            return
        }

        this.console.runScript(args[0], 0)
    }

    onTabComplete(args) {
        return super.onTabComplete(args);
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
        return "Выполнить скрипт"
    }
}

export default RunCommand;