import Logger from '../log/logger';
import * as fs from 'fs';
import ConsoleWindow from './console-window';
import * as path from 'path';
import ArgumentParser from './argument-parser';

// @ts-ignore
import CommandList from "../commands/types/*"
import Command from "../commands/command";
import Server from "../server";
import StdCatchLogger from "../log/std-catch-logger";

export interface ConsoleAutocompleteOptions {
	/// Indicates whether only one completion unit is required
	single?: boolean
}

class Console {
	public observingRoom: any;
	public visible: any;
	public prompt: any;
	public tabCompleteIndex: any;
	public tabCompletions: any;
	public window: ConsoleWindow;
	public currentLogger: Logger;
	public commands = new Map<string, Command>();
	public stdLogger: StdCatchLogger
	public server: Server = null
	public logger: Logger = null

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

		this.window.on("keypress", () => this.updateAutosuggestion())
		this.window.on("keypress", () => this.tabCompleteClear())
		this.window.on("history-walk", () => {
			this.tabCompleteClear()
			this.window.suggest(null)
		})
		this.window.on("exit", 	() => this.commands.get("exit").onPerform([]))
		this.window.on("command", 	(command: string) => this.evaluate(command))
		this.window.on("tab", (shift) => {
			if (this.tabCompletions) {
				if(shift) this.tabCompletePrevious()
				else this.tabCompleteNext()
			} else {
				this.tabCompleteBegin(this.window.getValue(), shift)
			}
		})

		this.logger.addDestination(this.window.destination)
	}

	private getAutocompletes(args: string[], options: ConsoleAutocompleteOptions): string[] {

		if(args.length <= 1) {

			let completions = []
			for(let command of this.commands.values()) {
				let name = command.getName()

				if(args.length === 0 || name.startsWith(args[0])) {
					completions.push(name)
				}
			}
			return completions
		} else {
			let command = this.commands.get(args[0])
			if (command) {

				let completions = command.onTabComplete(args.slice(1), options)

				if(completions) return completions
			}
		}

		return null
	}
	tabCompleteBegin(line: string, shift: boolean): void {
		let args = ArgumentParser.parseArguments(line)
		this.tabCompletions = this.getAutocompletes(args, {
			single: false
		})

		if (this.tabCompletions && this.tabCompletions.length) {
			this.updateAutosuggestion()

			if(this.tabCompletions.length > 1) {
				this.logger.log(this.tabCompletions.join(", "))
			}

			let prefix = ArgumentParser.trimLastArgument(line, false)

			this.tabCompletions = this.tabCompletions.map((completion: string) => {
				if(completion.indexOf(' ') != -1) {
					completion = "'" + completion + "'"
				}

				return prefix + completion
			})

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

	tabCompleteClear(): void {
		this.tabCompletions = null
		this.tabCompleteIndex = null
	}

	updateAutosuggestion(): void {

		if(this.tabCompletions) {
			this.window.suggest(null)
			return
		}

		let cursorPosition = this.window.consoleBox.consoleTextbox.cursorPosition
		let line = this.window.getValue()

		if(line.length == 0 || cursorPosition != line.length) {
			this.window.suggest(null)
			return
		}

		let args = ArgumentParser.parseArguments(line)
		let completions = this.getAutocompletes(args, {
			single: true
		})

		if(completions && completions.length == 1) {
			let lastArgument = args[args.length - 1]
			this.window.suggest(completions[0].substr(lastArgument.length), false)
		} else {
			this.window.suggest(null)
		}
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
		const file = path.resolve(__dirname, "resources/scripts", name + ".script")

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