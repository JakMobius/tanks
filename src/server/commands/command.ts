
import StringRepeat from '../../utils/stringrepeat';
import CommandFlag from "./commandflag";

class Command {

	/**
	 * @type {Console}
	 */
	console = null

	/**
	 * @type {Command[]}
	 */
	subcommands = []

	/**
	 * @type {CommandFlag[]}
	 */
	flags = []

	/**
	 * @type {Command | null}
	 */
	supercommand = null

	constructor(options) {
		if(options) {
			this.console = options.console
		}
	}

	/**
	 * Adds a flag to this command
	 */

	addFlag(flag) {
		this.flags.push(flag)
	}

	/**
	 * Adds a subcommand to this command
	 */

	addSubcommand(subcommand) {
		this.subcommands.push(subcommand)
		subcommand.supercommand = this
	}

	/**
	 * Called when user call the command.
	 * @param args Command arguments array
	 */

	onPerform(args) {
		if(!this.trySubcommand(args)) {
			this.console.logger.log(this.getHelp())
		}
	}

	/**
	 * Search for command-specific flags in given arguments
 	 * @param args: string[]
	 * @return {{
	 * 		flags: Map<string, string[]|boolean>,
	 * 		unknown: string[],
	 * 		errors: string[] | null,
	 * 		currentFlag: string | null
	 * 	}}
	 */

	findFlags(args) {

		/**
		 * @type {Map<string, string[]|boolean>}
		 */
		let knownFlags = new Map()
		let unknownFlags = []
		let currentFlagName = null

		/**
		 * This variable is intended to indicate if
		 * flag value is being readen. We cannot
		 * use `currentFlag === null` comparsion here
		 * because we want to remain `currentFlag`
		 * after the last cycle.
		 * @type {boolean}
		 */
		let readFlag = false

		/** @type {CommandFlag | null} */
		let currentFlag = null
		/** @type {string[]} */
		let errors = []

		for(let arg of args) {

			if(!readFlag) {
				currentFlag = null
				currentFlagName = null
			}

			if(arg.startsWith("-")) {
				let name = arg.substr(1)
				let flag = this.getFlag(name)

				if(!flag) {
					unknownFlags.push(name)
					continue
				}

				if(flag.type === "key") {
					if(!knownFlags.has(flag.name))
						knownFlags.set(flag.name, [])
					currentFlag = flag
					currentFlagName = name
					readFlag = true
				} else {
					if(!knownFlags.has(flag.name))
						knownFlags.set(flag.name, true)
				}

				continue
			}

			if(currentFlag !== null) {
				knownFlags.get(currentFlag.name).push(arg)
			}

			readFlag = false
		}

		if(readFlag) {
			errors.push(`'-${currentFlagName}' flag requires value`)
		}

		return {
			flags: knownFlags,
			unknown: unknownFlags,
			errors: errors.length ? errors : null,
			currentFlag: currentFlag
		}
	}

	/**
	 * Prints formatted flag error
	 * @param found
	 * @param logger
	 */

	logFlagErrors(found, logger) {
		if(found.errors) {
			logger.log(found.errors.join("\n"))
		}
		if(found.unknown.length) {
			logger.log("§FF0;Unknown flags: " + found.unknown.join("\n"))
		}
	}

	/**
	 * Tries to find subcommand with provided name
	 * @param name Name or alias for subcommand to search
	 * @returns `null` if the flag was not found, {@link Command} otherwise
	 */
	getSubcommand(name: string): Command | null {
		for(let command of this.subcommands) {
			if(command.getName() === name) {
				return command
			}
		}

		return null
	}

	/**
	 * Tries to find flag with provided name
	 * @param {string} name
	 * @returns `null` if the flag was not found, {@link CommandFlag} otherwise
	 */
	getFlag(name): CommandFlag | null {
		for(let flag of this.flags) {
			if(flag.name === name || flag.aliases.indexOf(name) !== -1) {
				return flag
			}
		}

		return null
	}

	/**
	 * Calls the corresponding subcommand based on command call arguments
	 * @param args Call arguments
	 * @returns True if subcommand was called successfully, false otherwise
	 * @example
	 * // Will try to call subcommand called `"create"` with arguments `["empty", "-n", "Empty Room"]`
	 * this.trySubcommand(["create", "empty", "-n", "Empty Room"])
	 */
	trySubcommand(args: string[]): boolean {
		if(args.length === 0) return false

		let found = this.getSubcommand(args[0])

		if(!found) return false

		found.onPerform(args.slice(1))
		return true
	}

	/**
	 * Tries to found commands that could be tab-completed
	 * @param args {string[]}
	 */

	tryTabCompleteSubcommand(args: string[]): string[] {
		if(args.length === 0) return []

		let subcommand = args[0]

		if(args.length === 1) {
			return this.subcommands
				.filter(a => a.getName().startsWith(subcommand))
				.map(a => a.getName())
		}

		let found = this.getSubcommand(subcommand)

		if(found) {
			return found.onTabComplete(args.slice(1))
		}

		return []
	}

	/**
	 * Called when user tab-complete the command.
	 * @param args Command arguments array
	 */

	onTabComplete(args: string[]) : string[] {
		return this.tryTabCompleteSubcommand(args)
	}

	/**
	 * Getter for command description
	 * @returns command description
	 */

	getDescription(): string {
		return null
	}

	/**
	 * Getter for command name
	 * @returns {string} command name
	 * @abstract
	 */

	getName(): string {
		throw new Error("Abstract method Command.getName called!");
	}

	/**
	 * Hierarchy name is joined parent names. For `"commandA commandB commandC"`
	 * calling this method on `"commandB"` will return `"commandA commandB"`
	 * @returns {string} Hierarchy name.
	 */

	getHierarchyName() {
		let result = ""
		for(let parent = this; parent; parent = parent.supercommand) {
			if(result.length) result = " " + result
			result = parent.getName() + result
		}
		return result
	}

	/**
	 * Getter for command usage
	 * @returns command usage
	 */

	getUsage() {
		if(this.subcommands.length) {
			return this.getHierarchyName() + " <" + this.subcommands.map(a => a.getName()).join("|") + ">"
		}

		return this.getHierarchyName()
	}

	/**
	 * Indicates if command should be called from a room only.
	 * If user tries to call this command from outside the room,
	 * localized error will be logged.
	 * @returns `true` if command should be called from the room, `false` otherwise.
	 */

	requiresRoom() {
		return false
	}

	/**
	 * @returns {string} large help text with usage, flags, and all the stuff user might be searching for
	 */

	getHelp() {
		let result = "Использование: " + this.getUsage()

		if(this.subcommands.length) {
			result += "\n"

			let commandUsages = this.subcommands.map(a => " - " + a.getUsage())

			let length = commandUsages.reduce((a, b) => Math.max(a, b.length), 0)
			let i = 0

			for(let command of this.subcommands) {
				let usage = commandUsages[i++]
				let description = command.getDescription()

				if(description) {
					result += usage + StringRepeat(" ", length - usage.length) + " - " + description + "\n"
				} else {
					result += usage + "\n"
				}
			}
		}

		if(this.flags.length) {
			result += "\n\nФлаги:\n"

			let flagUsages = this.flags.map(flag => {
				let usage = " -" + flag.name
				if(flag.aliases.length) {
					usage += " (-" + flag.aliases.join(", -") + ")"
				}
				return usage
			})

			let length = flagUsages.reduce((a, b) => Math.max(a, b.length), 0)
			let i = 0

			for(let flag of this.flags) {
				let usage = flagUsages[i++]

				if(flag.description) {
					result += usage + StringRepeat(" ", length - usage.length) + " - " + flag.description + "\n"
				} else {
					result += usage + "\n"
				}
			}
		}

		return result
	}
}

export default Command;