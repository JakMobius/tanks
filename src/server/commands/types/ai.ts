import Command from '../command';
import BotClient from '../../ai/bot';

class AICommand extends Command {
	public observingRoom: any;

    onPerform(args: string[]) {
        let logger = this.console.logger

        if (args.length < 1) {
            logger.log("Usage: " + this.getUsage())
            return
        }

    }

    getDescription(): string {
        return "AI control command"
    }

    getName(): string {
        return "ai"
    }

    getUsage(): string {
        return "ai <create|remove|list|save|screenshot> [ник]"
    }

    requiresRoom(): boolean {
        return true;
    }
}

export default AICommand;