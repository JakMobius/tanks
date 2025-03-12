import Command from '../command';
import ConsoleTableDrawer from "src/server/console/console-table-drawer";

export default class HelpCommand extends Command {

    onPerform(args: string[]) {
        let logger = this.console.logger

        let lines: string[][] = []

        for(let command of this.console.commands.values()) {
            let firstRow = " " + (command.getUsage() || command)
            let secondRow = "§777; - " + (command.getDescription() || "No description")
            lines.push([firstRow, secondRow])
        }

        let string = "§!;Commands:\n" + new ConsoleTableDrawer({
            lines: lines,
            rowPadding: 1
        }).draw()

        logger.log(string)
        
        return true
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