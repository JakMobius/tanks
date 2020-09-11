
const Command = require("../command.js")

class RunCommand extends Command {

    onPerform(args) {
        if(args.length !== 1) {
            this.logger.log("Использование: " + this.getUsage())
            return
        }

        this.console.runScript(args[0], 0)
    }

    onTabComplete(args) {
        super.onTabComplete(args);
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

module.exports = RunCommand