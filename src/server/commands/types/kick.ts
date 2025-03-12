import Command from '../command';

export default class KickCommand extends Command {
    onPerform(args: string[]) {

        let logger = this.console.logger

        if(args.length < 1) {
            logger.log("Usage: " + this.getUsage())
            return false
        }

        const name = args.join(" ")
        let kicked = false

        // TODO:
        // for(let c of this.console.server.gameSocket.clients.values()) {
        //     if (c.data.player && c.data.player.nick.trim() === name) {
        //         c.connection.close("You were kicked from this server")
        //         logger.log(" - Kicked '" + name + "' (id = " + c.id + ")")
        //         kicked = true
        //     }
        // }

        if(!kicked) {
            logger.log("'" + name + "' is offline")
            return false
        }

        return true
    }

    getDescription(): string {
        return "Kick player"
    }

    getName(): string {
        return "kick"
    }

    getUsage(): string {
        return "kick <nick>"
    }

    requiresRoom(): boolean {
        return true
    }
}