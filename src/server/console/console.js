const Logger = require("../log/logger")
const fs = require("fs")
const ConsoleWindow = require("./consolewindow")
const path = require("path")

class Console {
	commands = new Map();

	/**
	 * @type {GameSocket}
	 */
	server = null

	/**
	 * @type {Logger}
	 */
	logger = null

	constructor() {
		this.server = null
		this.observingRoom = null
		this.visible = true
		this.currentLogger = null
		this.prompt = null

		this.tabCompleteIndex = null
		this.tabCompletions = null

		this.logger = Logger.global

		this.loadCommands()
	}

	createWindow() {
		this.window = new ConsoleWindow()

		this.window.on("tab", () => {
			if (this.tabCompletions) {
				this.tabCompleteNext()
			} else {
				this.tabCompleteBegin(this.window.consoleTextbox.value)
			}
		})
		this.window.on("keypress", () => {
			this.tabComplete()
		})
		this.window.on("exit", () => {
			this.commands.get("exit").onPerform([])
		})
		this.window.on("command", (command) => {
			this.evaluate(command)
		})

		this.logger.addDestination(this.window.destination)
	}

	tabCompleteBegin(line) {
		let args = this.parseArguments(line)

		if(args.length <= 1) {

			this.tabCompletions = []
			for(let command of this.commands.values()) {
				let name = command.getName()

				if(args.length === 0 || name.startsWith(args[0])) {
					this.tabCompletions.push(name)
				}
			}
			if(this.tabCompletions.length > 1)
				this.logger.log(this.tabCompletions.join(", "))
		} else {
			let command = this.commands.get(args[0])
			if (command) {
				let line = args.slice(0, -1).join(" ") + " "
				let completions = command.onTabComplete(args.slice(1))
				if(completions.length) {
					if(completions.length > 1)
						this.logger.log(completions.join(", "))
					this.tabCompletions = completions.map(arg => {
						if(arg.indexOf(" ") !== -1) {
							arg = "'" + arg + "'"
						}
						return line + arg
					})
				}
			}
		}

		if (this.tabCompletions && this.tabCompletions.length) {
			if(this.tabCompletions.length > 1) {
				this.tabCompleteIndex = 0
				this.tabCompleteNext()
				return
			}

			this.window.setLine(this.tabCompletions[0])
		}

		this.tabCompletions = null
	}

	tabCompleteNext() {
		this.window.setLine(this.tabCompletions[this.tabCompleteIndex])
		this.tabCompleteIndex++
		if(this.tabCompleteIndex >= this.tabCompletions.length) {
			this.tabCompleteIndex = 0
		}
	}

	tabComplete() {
		this.tabCompletions = null
		this.tabCompleteIndex = null
	}

	parseArguments(line, keepQuotes) {
		let escape = false
		let string = null
		let comment = null
		let argument = ""
		let result = []

		for(let character of line) {

			if(comment) {
				if(character === "\n") comment = false
				continue
			}

			if(!escape) {
				if (character === "\\") {
					escape = true
					continue
				}

				if (string === null) {
					if (character === "\"" || character === "\'") {
						string = character
						if(keepQuotes) argument += character
						continue
					}
				} else {
					if(character === string) {
						if(keepQuotes) argument += character
						string = null
						continue
					}
				}

				if(character === "#") {
					comment = true
					continue
				}

				if(character === " " && !string) {
					if(argument) {
						result.push(argument)
						argument = ""
					}
					continue
				}
			}

			argument += character

			escape = false
		}

		result.push(argument)

		return result
	}

	evaluate(line) {

		line = line.trim()

		this.logger.log("> §!FFF;" + line)

		if(line.length === 0) return

		let command = this.parseArguments(line)

		if(!command.length || command[0].length === 0) return

		let handle = this.commands.get(command[0])

		if (handle) {
			this.callHandle(handle, command.slice(1))
        } else {
            this.logger.log("§F00;Неизвестная команда: '" + command[0] + "'")
        }
	}

	callHandle(handle, args) {
		if (handle.requiresRoom() && !this.observingRoom) {
			this.logger.log("§F00;Для использования этой команды необходимо находиться в комнате")
		} else {
			handle.onPerform(args)
		}
	}

	switchToLogger(logger) {
		if(this.currentLogger) {
			this.currentLogger.removeDestination(this.logger)
		}
		logger.addDestination(this.logger)
		this.currentLogger = logger
	}

	runScript(name, index) {
		const file = path.resolve(__dirname, "..", "scripts", name + ".script")

		if(!fs.existsSync(file)) {
			this.logger.log("§F00;Не удалось выполнить скрипт '" + name + "'. Убедитесь, что файл существует.")
			return
		}
		this.logger.log("§FF0;Выполнение скрипта " + name)

		const commands = fs.readFileSync(file, 'utf8').split("\n")
		for(let i = index || 0; i < commands.length; i++) {
			const command = commands[i]
			this.evaluate(command)
		}
	}

	loadCommands() {
		for(let Command of require("../commands/types/")) {
			let command = new Command({
				console: this
			})
			this.commands.set(command.getName(), command);
		}
	}
}

module.exports = Console