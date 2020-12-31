import Command from '../command';
import BotClient from '../../ai/bot';

class AICommand extends Command {
	public observingRoom: any;

    onPerform(args) {
        let logger = this.console.logger

        if (args.length < 1) {
            logger.log("Использование: " + this.getUsage())
            return
        }

        let action = args[0]

        if (action === "create") {
            const nick = args[1] || "BOT";

            const client = new BotClient()

            client.server = this.console.server
            client.nick = nick
            client.connectToRoom(this.console.observingRoom)
        } else if (action === "list") {
            let botList = []
            for (let client of this.observingRoom.clients.values()) {
                if (client instanceof BotClient) {
                    botList.push(client)
                }
            }

            for (let bot of botList) {
                logger.log(`#${bot.id}: ${bot.nick}`)
            }
        } else if (action === "remove") {
            if (args[1] === "all") {
                for (let client of this.observingRoom.clients.values()) {
                    if (client.isBot) {
                        client.connection.close()
                    }
                }
                return
            }

            let target = Number(args[1])

            if (target === undefined || Number.isNaN(target)) {
                logger.log("Использование: ai remove <id>")
                return
            }

            let client = this.console.observingRoom.clients.get(target)

            if (client) {
                if (client instanceof BotClient) {
                    client.connection.close()
                } else {
                    logger.log(`Клиент #${client.id} не является ботом`)
                    logger.log(`Чтобы удалить игрока с карты, используйте команду kick`)
                }
            } else {
                logger.log(`Бота #${target} не существует`)
            }
        } else if (action === "enable") {

        } else {
            logger.log("Использование: " + this.getUsage())

        }
    }

    onTabComplete(args) {
        return super.onTabComplete(args);
    }

    getDescription() {
        return "Управление AI"
    }

    getName() {
        return "ai"
    }

    getUsage() {
        return "ai <create|remove|list|save|screenshot> [ник]"
    }

    requiresRoom() {
        return true;
    }
}

export default AICommand;