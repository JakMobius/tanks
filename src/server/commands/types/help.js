
const Command = require("../command")
const Chalk = require("chalk")

class HelpCommand extends Command {

    onPerform(args) {
        let logger = this.console.logger

        logger.log(Chalk.bold("Команды:"))

        let length = 0

        for(let command of this.console.commands.values()) {
            let usage = command.getUsage() || key
            if (length < usage.length) {
                length = usage.length
            }
        }

        let dash = Chalk.gray(" - ")

        for(let command of this.console.commands.values()) {

            let str = " " + (command.getUsage() || key)

            for (let i = str.length; i <= length; i++) {
                str += " "
            }

            let desc = command.getDescription() || "Нет описания"

            logger.log(str + dash + desc)
        }
    }

    getName() {
        return "help"
    }

    getDescription() {
        return "Помощь"
    }

    getUsage() {
        return "help"
    }
}

module.exports = HelpCommand