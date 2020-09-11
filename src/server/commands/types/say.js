
const Command = require("../command.js")
const PlayerChatPacket = require("/src/networking/packets/playerchatpacket")

class SayCommand extends Command {
    onPerform(args) {
        let text = args.join(" ")

        let packet = new PlayerChatPacket(text)
        this.console.observingRoom.broadcast(packet)
        this.console.logger.log(text)
    }

    getName() {
        return "say"
    }

    getDescription() {
        return "Вывести сообщение в чат всей комнате"
    }

    getUsage() {
        return `say <текст>`
    }

    requiresRoom() { return true }
}

module.exports = SayCommand