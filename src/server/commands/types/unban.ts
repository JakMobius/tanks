import Command from '../command';

export default class UnbanCommand extends Command {

    onPerform(args: string[]) {
        let logger = this.console.logger
        if(args.length !== 1) {
            logger.log("Usage: " + this.getUsage())
            return false
        }

        const ip = args[0]
        // const index = this.server.banned.indexOf(ip)

        // if(index === -1) {
        //     logger.log("ip " + ip + " is not banned")
        //     return false
        // } else {
        //     this.server.banned.splice(index, 1)
        //     logger.log(" - Unbanned ip " + ip)
        //     return true
        // }

        return true
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