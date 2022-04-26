import Command from '../command';
import PlayerChatPacket from 'src/networking/packets/game-packets/player-chat-packet';

export default class SayCommand extends Command {
    onPerform(args: string[]): void {
        let text = args.join(" ")

        let packet = new PlayerChatPacket(text)
        this.console.observingRoom.broadcast(packet)
        this.console.logger.log(text)
    }

    getName(): string {
        return "say"
    }

    getDescription(): string {
        return "Broadcast a message to current room"
    }

    getUsage(): string {
        return `say <message>`
    }

    requiresRoom(): boolean {
        return true
    }
}