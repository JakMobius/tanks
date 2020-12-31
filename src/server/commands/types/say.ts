
import Command from '../command';
import PlayerChatPacket from '@/networking/packets/game-packets/playerchatpacket';

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
        return "Broadcast a message to current room"
    }

    getUsage() {
        return `say <message>`
    }

    requiresRoom() { return true }
}

export default SayCommand;