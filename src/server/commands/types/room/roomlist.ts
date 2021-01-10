import Chalk from 'chalk';
import Command from '../../command';

class RoomListCommand extends Command {
    onPerform(args: string[]) {
        let logger = this.console.logger
        let rooms = this.console.server.gameSocket.games
        let roomCount = rooms.size

        if (roomCount === 0) {
            logger.log(
                "§F77;Нет активных комнат\n" +
                "§777; ⭑ §;Для создания новой комнаты используйте команду room create"
        );

        } else {
            let string = "Активных комнат: §7FF;" + roomCount + "\n"

            let totalOnline = 0
            let dot = Chalk.gray(" • ")

            for (let [id, room] of rooms.entries()) {
                let online = room.clients.size
                totalOnline += online

                string += dot + id + ": " + online + " онлайн\n"
            }

            string += "Суммарный онлайн: : §7FF;" + totalOnline

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