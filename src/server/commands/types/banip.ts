
import Command from '../command';

class BanIPCommand extends Command {
	public logger: any;
	public server: any;

    onPerform(args) {
        if(args.length < 1) {
            this.logger.log("Использование: " + this.getUsage())
            return
        }

        const name = args.join(" ")
        let kicked = false

        for(let c of this.server.clients.values()) {
            if (c.data.player && c.data.player.nick.trim() === name) {
                c.connection.close(1000, "Администратор внёс Ваш ip в бан-лист")

                const ip = c.connection._socket.remoteAddress

                this.server.banned.push(ip)

                this.logger.log(" - Забанен игрок #" + c.id + " с ником " + name + " и ip " + ip)
                kicked = true
            }
        }

        if(!kicked) {
            this.logger.log("Не найдено игрока (игроков) с ником " + name)
        }
    }

    onTabComplete(args) {
        super.onTabComplete(args);
    }

    getDescription() {
        return "Забанить игрока по айпи (до перезагрузки сервера)"
    }

    getName() {
        return "banip"
    }

    getUsage() {
        return "banip <nick>"
    }

    requiresRoom() {
        return true
    }
}

export default BanIPCommand;