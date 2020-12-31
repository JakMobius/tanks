
import Command from '../command';

class KickCommand extends Command {
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
                c.connection.close(1000, "Вас кикнули")
                this.logger.log(" - Кикнут игрок #" + c.id + " с ником " + name)
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
        return "Кикнуть клиента"
    }

    getName() {
        return "kick"
    }

    getUsage() {
        return "kick <nick>"
    }

    requiresRoom() {
        return true
    }
}

export default KickCommand;