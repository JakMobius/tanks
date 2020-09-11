
let Command = require("../command.js")

class ExitCommand extends Command {

	onPerform() {
		// if(this.console.currentLogger !== this.console.server.logger) {
		// 	this.console.render()
		// 	return
		// }
		this.console.server.terminate()
		process.exit(0)
	}

	getName() {
        return "exit";
    }

    getDescription() {
        return "Выйти из комнаты / закрыть сервер";
    }

    getUsage() {
		return "exit"
	}
}

module.exports = ExitCommand