import Chalk from 'chalk';
import Command from '../../command';
import ConsoleTableDrawer from "../../../console/console-table-drawer";
import CLIStyle from "../../cli-style";

class RoomListCommand extends Command {
    onPerform(args: string[]) {
        let logger = this.console.logger
        let rooms = this.console.server.gameSocket.games
        let roomCount = rooms.size

        if (roomCount === 0) {
            logger.log(
                "§F77;No active rooms\n" +
                CLIStyle.tip("To create a room, use 'room create' command")
        );

        } else {
            let string = ""

            let totalOnline = 0
            let dot = Chalk.gray(" • ")
            let lines: string[][] = []

            lines.push([Chalk.bold("Room name"), Chalk.bold("Players online")])

            for (let [id, room] of rooms.entries()) {
                let online = room.getCurrentOnline()
                totalOnline += online

                lines.push([dot + id, Chalk.cyanBright(online)])
            }

            string += new ConsoleTableDrawer({
                lines: lines,
                rowPadding: 1
            }).draw()

            string += "\n"
                    + "Active rooms: §7FF;" + roomCount + "\n"
                    + "Total players online: §7FF;" + totalOnline

            logger.log(string)
        }
    }

    getName() {
        return "list"
    }

    getDescription() {
        return "Отобразить список комнат"
    }
}

export default RoomListCommand;