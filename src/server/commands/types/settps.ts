
import Command from '../command';

class SetTpsCommand extends Command {

    onPerform(args: string[]) {
        let tps = Number(args[0])

        if(!tps) {
            this.console.logger.log("Usage: " + this.getUsage())
            return
        }

        if(tps > 1000) tps = 1000
        if(tps < 1) tps = 1

        tps = Math.round(tps)
        this.console.observingRoom.speedupGame(tps / 20)
    }

    getDescription(): string {
        return "Change room TPS"
    }

    getName(): string {
        return "settps"
    }

    getUsage(): string {
        return "settps <tps>"
    }

    requiresRoom(): boolean {
        return true
    }
}

export default SetTpsCommand;