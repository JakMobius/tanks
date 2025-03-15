import Command from '../command';

export default class ExitCommand extends Command {

	async onPerform() {
		// if(this.console.currentLogger !== this.console.server.logger) {
		// 	this.console.render()
		// 	return
		// }
		await this.console.server.terminate()
		return true
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