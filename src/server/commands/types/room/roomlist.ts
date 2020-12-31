import Chalk from 'chalk';
import Command from '../../command';

class RoomListCommand extends Command {
    onPerform(args) {
        let logger = this.console.logger
        let rooms = this.console.server.games
        let roomCount = rooms.size

        if (roomCount === 0) {
            logger.log(
                Chalk.redBright("Нет активных комнат\n") +
                Chalk.gray(" ⭑ ") + "Для создания новой комнаты используйте команду room create"
        );

        } else {
            let string = "Активных комнат: " + Chalk.cyanBright(roomCount) + "\n"

            let totalOnline = 0
            let dot = Chalk.gray(" • ")

            for (let [id, room] of rooms.entries()) {
                let online = room.clients.size
                totalOnline += online

                string += dot + id + ": " + online + " онлайн\n"
            }

            string += "Суммарный онлайн: " + Chalk.cyanBright(totalOnline)

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