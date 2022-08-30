import Command from '../command';

export default class UnbanCommand extends Command {
	public server: any;

    onPerform(args: string[]) {
        let logger = this.console.logger
        if(args.length !== 1) {
            logger.log("Usage: " + this.getUsage())
            return
        }

        const ip = args[0]
        const index = this.server.banned.indexOf(ip)

        if(index === -1) {
            logger.log("ip " + ip + " is not banned")
        } else {
            this.server.banned.splice(index, 1)
            logger.log(" - Unbanned ip " + ip)
        }
    }

    getDescription() {
        return "Unban player"
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