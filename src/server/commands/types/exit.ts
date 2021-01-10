
import Command from '../command';

class ExitCommand extends Command {

	onPerform(): void {
		// if(this.console.currentLogger !== this.console.server.logger) {
		// 	this.console.render()
		// 	return
		// }
		this.console.server.terminate()
		process.exit(0)
	}

	getName(): string {
        return "exit";
    }

    getDescription(): string {
        return "Escape the room / terminate the server";
    }

    getUsage(): string {
		return "exit"
	}
}

export default ExitCommand;