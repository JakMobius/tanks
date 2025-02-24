import Command from '../command';

export default class SayCommand extends Command {
    onPerform(args: string[]): void {
        let text = args.join(" ")
        this.console.observingRoom.emit("chat", text)
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