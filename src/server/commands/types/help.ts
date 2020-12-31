
import Command from '../command';
import Chalk from 'chalk';

class HelpCommand extends Command {

    onPerform(args) {
        let logger = this.console.logger

        logger.log(Chalk.bold("Команды:"))

        let length = 0

        for(let command of this.console.commands.values()) {
            let usage = command.getUsage() || command
            if (length < usage.length) {
                length = usage.length
            }
        }

        let dash = Chalk.gray(" - ")

        for(let command of this.console.commands.values()) {

            let str = " " + (command.getUsage() || command)

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

export default HelpCommand;