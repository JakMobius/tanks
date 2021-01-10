
import Command from '../command';
import Chalk from 'chalk';

class HelpCommand extends Command {

    onPerform(args: string[]): void {
        let logger = this.console.logger

        logger.log("§!;Commands:")

        let length = 0

        for(let command of this.console.commands.values()) {
            let usage = command.getUsage()
            if (length < usage.length) {
                length = usage.length
            }
        }

        let dash = "§777; - "

        for(let command of this.console.commands.values()) {

            let str = " " + (command.getUsage() || command)

            for (let i = str.length; i <= length; i++) {
                str += " "
            }

            let desc = command.getDescription() || "No description"

            logger.log(str + dash + desc)
        }
    }

    getName(): string {
        return "help"
    }

    getDescription(): string {
        return "Help"
    }

    getUsage(): string {
        return "help"
    }
}

export default HelpCommand;