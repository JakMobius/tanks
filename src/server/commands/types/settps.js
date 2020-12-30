
const Command = require("../command.js")

class SetTpsCommand extends Command {

    onPerform(args) {
        let tps = Number(args[0])

        if(!tps) {
            this.logger.log("Usage: " + this.getUsage())
            return
        }

        if(tps > 1000) tps = 1000
        if(tps < 1) tps = 1

        tps = Math.round(tps)
        this.observingRoom.speedupGame(tps / 20)
    }

    onTabComplete(args) {
        super.onTabComplete(args);
    }

    getDescription() {
        return "Установить TPS для текущей комнаты"
    }

    getName() {
        return "settps"
    }

    getUsage() {
        return "settps <tps>"
    }

    requiresRoom() {
        return true
    }
}

module.exports = SetTpsCommand