import Command from '../command';

class KickCommand extends Command {
    onPerform(args: string[]): void {

        let logger = this.console.logger

        if(args.length < 1) {
            logger.log("Usage: " + this.getUsage())
            return
        }

        const name = args.join(" ")
        let kicked = false

        for(let c of this.console.server.gameSocket.clients.values()) {
            if (c.data.player && c.data.player.nick.trim() === name) {
                c.connection.close("You were kicked from this server")
                logger.log(" - Kicked '" + name + "' (id = " + c.id + ")")
                kicked = true
            }
        }

        if(!kicked) {
            logger.log("'" + name + "' is offline")
        }
    }

    getDescription(): string {
        return "Кикнуть клиента"
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

export default KickCommand;