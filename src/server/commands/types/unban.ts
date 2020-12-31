
import Command from '../command';

class UnbanCommand extends Command {
	public server: any;

    onPerform(args) {
        let logger = this.console.logger
        if(args.length !== 1) {
            logger.log("Использование: " + this.getUsage())
            return
        }

        const ip = args[0]
        const index = this.server.banned.indexOf(ip)

        if(index === -1) {
            logger.log("ip " + ip + " не был забанен")
        } else {
            this.server.banned.splice(index, 1)
            logger.log(" - Разбанен ip " + ip)
        }
    }

    onTabComplete(args) {
        super.onTabComplete(args);
    }

    getDescription() {
        return "Разбанить игрока"
    }

    getName() {
        return "unban"
    }

    getUsage() {
        return "unban <ip>"
    }

    requiresRoom() {
        return false
    }
}

export default UnbanCommand;