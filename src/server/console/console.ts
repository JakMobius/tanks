import Logger from '../log/logger';
import * as fs from 'fs';
import ConsoleWindow from './consolewindow';
import * as path from 'path';
import ArgumentParser from './argument-parser';

// @ts-ignore
import CommandList from "../commands/types/*"
import Command from "../commands/command";
import Server from "../server";

class Console {
	public observingRoom: any;
	public visible: any;
	public prompt: any;
	public tabCompleteIndex: any;
	public tabCompletions: any;
	public window: ConsoleWindow;
	public currentLogger: Logger;
	commands = new Map<string, Command>();
	server: Server = null
	logger: Logger = null

	constructor() {
		this.server = null
		this.observingRoom = null
		this.visible = true
		this.prompt = null

		this.tabCompleteIndex = null
		this.tabCompletions = null

		this.logger = Logger.global

		this.loadCommands()
	}

	createWindow(): void {
		this.window = new ConsoleWindow()

		// Shift-tab feature doesn't work
		// in WebStorm internal console.

		this.window.on("tab", (shift: boolean) => {
			if (this.tabCompletions) {
				if(shift) {
					this.tabCompletePrevious()
				} else {
					this.tabCompleteNext()
				}
			} else {
				this.tabCompleteBegin(this.window.consoleTextbox.value, shift)
			}
		})
		this.window.on("keypress", () => {
			this.tabComplete()
		})
		this.window.on("exit", () => {
			this.commands.get("exit").onPerform([])
		})
		this.window.on("command", (command: string) => {
			this.evaluate(command)
		})

		this.logger.addDestination(this.window.destination)
	}

	tabCompleteBegin(line: string, shift: boolean): void {
		let args = ArgumentParser.parseArguments(line)

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
				let prefix = ArgumentParser.parseArguments(line, true).slice(0, -1).join(" ") + " "
				let completions = command.onTabComplete(args.slice(1))
				if(completions.length) {
					if(completions.length > 1) {
						this.logger.log(completions.join(", "))
					}

					this.tabCompletions = completions.map(arg => {
						if(arg.indexOf(" ") !== -1) {
							arg = "'" + arg + "'"
						}
						return prefix + arg
					})
				}
			}
		}

		if (this.tabCompletions && this.tabCompletions.length) {
			if(this.tabCompletions.length > 1) {
				if(shift) {
					this.tabCompleteIndex = this.tabCompletions.length
					this.tabCompletePrevious()
				} else {
					this.tabCompleteIndex = -1
					this.tabCompleteNext()
				}
				return
			}

			this.window.setLine(this.tabCompletions[0])
		}

		this.tabCompletions = null
	}

	tabCompletePrevious(): void {
		this.tabCompleteIndex--
		if(this.tabCompleteIndex < 0) this.tabCompleteIndex = this.tabCompletions.length - 1;
		this.window.setLine(this.tabCompletions[this.tabCompleteIndex])
	}

	tabCompleteNext(): void {
		this.tabCompleteIndex++
		if(this.tabCompleteIndex >= this.tabCompletions.length) {
			this.tabCompleteIndex = 0
		}
		this.window.setLine(this.tabCompletions[this.tabCompleteIndex])
	}

	tabComplete(): void {
		this.tabCompletions = null
		this.tabCompleteIndex = null
	}

	evaluate(line: string): void {

		line = line.trim()

		this.logger.log("> §!FFF;" + line)

		if(line.length === 0) return

		let command = ArgumentParser.parseArguments(line)

		if(!command.length || command[0].length === 0) return

		let handle = this.commands.get(command[0])

		if (handle) {
			this.callHandle(handle, command.slice(1))
        } else {
            this.logger.log("§F00;Unknown command: '" + command[0] + "'")
        }
	}

	callHandle(handle: Command, args: string[]) {
		if (handle.requiresRoom() && !this.observingRoom) {
			this.logger.log("§F00;You should be in a room for executing this command")
		} else {
			handle.onPerform(args)
		}
	}

	switchToLogger(logger: Logger) {
		if(this.currentLogger) {
			this.currentLogger.removeDestination(this.logger)
		}
		logger.addDestination(this.logger)
		this.currentLogger = logger
	}

	runScript(name: string, index: number = 0) {
		const file = path.resolve(__dirname, "..", "scripts", name + ".script")

		if(!fs.existsSync(file)) {
			this.logger.log("§F00;Could not find script named '" + name + "'.")
			return
		}
		this.logger.log("§FF0;Running script '" + name + "'")

		const commands = fs.readFileSync(file, 'utf8').split("\n")
		for(let i = index; i < commands.length; i++) {
			const command = commands[i]
			this.evaluate(command)
		}
	}

	loadCommands() {
		for(let constructor of Object.values(CommandList)) {
			let command = new (constructor as typeof Command)({
				console: this
			})
			this.commands.set(command.getName(), command);
		}
	}
}

export default Console;