
import Command from '../command';

class BanIPCommand extends Command {
	public server: any;

    onPerform(args: string[]): void {

        let logger = this.console.logger

        if(args.length < 1) {
            logger.log("Использование: " + this.getUsage())
            return
        }

        const name = args.join(" ")
        let kicked = false

        for(let c of this.server.clients.values()) {
            if (c.data.player && c.data.player.nick.trim() === name) {
                c.connection.close(1000, "Администратор внёс Ваш ip в бан-лист")

                const ip = c.connection._socket.remoteAddress

                this.server.banned.push(ip)

                logger.log(" - Забанен игрок #" + c.id + " с ником " + name + " и ip " + ip)
                kicked = true
            }
        }

        if(!kicked) {
            logger.log("Не найдено игрока (игроков) с ником " + name)
        }
    }

    getDescription(): string {
        return "Забанить игрока по айпи (до перезагрузки сервера)"
    }

    getName(): string {
        return "banip"
    }

    getUsage(): string {
        return "banip <nick>"
    }

    requiresRoom(): boolean {
        return true
    }
}

export default BanIPCommand;