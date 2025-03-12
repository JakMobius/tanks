import CommandFlag from "./command-flag";
import Console, {ConsoleAutocompleteOptions} from '../console/console'
import Logger from "../log/logger";
import path from "path";
import fs from "fs";
import ConsoleTableDrawer from "../console/console-table-drawer";

export interface CommandParsedFlags {
    flags: Map<string, string[] | boolean>
	unknown: string[]
	errors: string[] | null
	currentFlag: CommandFlag | null
    incompleteFlag: string
}

export interface CommandConfig {
	console: Console
}

export default class Command {

	console: Console = null
	subcommands: Command[] = []
	flags: CommandFlag[] = []
	supercommand: Command = null

	constructor(options: CommandConfig) {
		this.console = options.console
	}

	/**
	 * Adds a flag to this command
	 */

	protected addFlag(flag: CommandFlag) {
		this.flags.push(flag)
	}

	/**
	 * Adds a subcommand to this command
	 */

	protected addSubcommand(subcommand: Command) {
		this.subcommands.push(subcommand)
		subcommand.supercommand = this
	}

	/**
	 * Called when user call the command.
	 * @param args Command arguments array
	 */

	public onPerform(args: string[]): Promise<boolean> | boolean {
		let subcommand = this.getSubcommand(args[0])

		if(!subcommand) {
			this.console.logger.log(this.getHelp())
			return false
		}

		return subcommand.onPerform(args.slice(1))
	}

	/**
	 * Search for command-specific flags in given arguments
	 */

	protected findFlags(args: string[]): CommandParsedFlags {

		let knownFlags = new Map<string, string[] | boolean>()
		let unknownFlags: string[] = []
		let currentFlagName: string | null = null
        let incompleteFlag: string

		/**
		 * This variable is intended to indicate if
		 * flag value is currenyly being read. We cannot
		 * use `currentFlag === null` comparsion here
		 * because we want to keep `currentFlag`
		 * after the last cycle.
		 */
		let readFlag = false

		let currentFlag: CommandFlag | null = null
		let errors: string[] = []

		for(let arg of args) {

			if(!readFlag) {
				currentFlag = null
				currentFlagName = null
			}

			if(arg.startsWith("-")) {
				let name = arg.substr(1)
				let flag = this.getFlag(name)

                incompleteFlag = arg

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

            incompleteFlag = null

			if(currentFlag !== null) {
				(knownFlags.get(currentFlag.name) as string[]).push(arg)
			}

			readFlag = false
		}

		if(readFlag) {
			errors.push(`'-${currentFlagName}' flag requires value`)
            currentFlag = null
		}

		return {
			flags: knownFlags,
			unknown: unknownFlags,
			errors: errors.length ? errors : null,
			currentFlag: currentFlag,
            incompleteFlag: incompleteFlag
		}
	}

	/**
	 * Prints formatted flag error
	 * @param found
	 * @param logger
	 */

	protected logFlagErrors(found: CommandParsedFlags, logger: Logger) {
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
	protected getSubcommand(name: string): Command | null {
		for(let command of this.subcommands) {
			if(command.getName() === name) {
				return command
			}
		}

		return null
	}

	/**
	 * Tries to find flag with provided name
	 * @returns `null` if the flag was not found, {@link CommandFlag} otherwise
	 */
	protected getFlag(name: string): CommandFlag | null {
		for(let flag of this.flags) {
			if(flag.name === name || flag.aliases.indexOf(name) !== -1) {
				return flag
			}
		}

		return null
	}

	/**
	 * Tries to found commands that could be tab-completed
	 */

	protected tryTabCompleteSubcommand(args: string[], options: ConsoleAutocompleteOptions): string[] {
		if(args.length === 0) return []

		let subcommand = args[0]

		if(args.length === 1) {
			return this.subcommands
				.filter(a => a.getName().startsWith(subcommand))
				.map(a => a.getName())
		}

		let found = this.getSubcommand(subcommand)

		if(found) {
			return found.onTabComplete(args.slice(1), options)
		}

		return []
	}

	/**
	 * Called when user tab-complete the command.
	 * @param args Command arguments array
	 * @param options Autocompletion gathering options
	 */

	public onTabComplete(args: string[], options: ConsoleAutocompleteOptions) : string[] {

	    let argumentCount = args.length
        if(argumentCount > 0 && !this.subcommands.length) {
            let lastFlag = args[argumentCount - 1]
            if(lastFlag.startsWith("-")) {
                return this.autocompleteFlags(args[argumentCount - 1], options)
            }
        }

        return this.tryTabCompleteSubcommand(args, options)
	}

	/**
	 * Getter for command description
	 * @returns command description
	 */

	public getDescription(): string {
		return null
	}

	/**
	 * Getter for command name
	 * @returns command name
	 */

	public getName(): string {
		throw "Called 'getName' on abstract class!"
	}

	/**
	 * Hierarchy name is joined parent names. For `"commandA commandB commandC"`
	 * calling this method on `"commandB"` will return `"commandA commandB"`
	 * @returns {string} Hierarchy name.
	 */

	public getHierarchyName() {
		let result = ""
		for(let parent: Command = this; parent; parent = parent.supercommand) {
			if(result.length) result = " " + result
			result = parent.getName() + result
		}
		return result
	}

	/**
	 * Getter for command usage
	 * @returns command usage
	 */

	public getUsage(): string {
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

	public requiresRoom(): boolean {
		return false
	}

	/**
	 * @returns large help text with usage, flags, and all the stuff user might be searching for
	 */

	public getHelp(): string {
		let result = "Usage: " + this.getUsage()

		if(this.subcommands.length) {
			let tableLines: string[][] = this.subcommands.map((command) => {
				return [" - " + command.getUsage(), " - " + command.getDescription()]
			})

			result += "\n" + new ConsoleTableDrawer({
				rowPadding: 1,
				lines: tableLines
			}).draw()
		}

		if(this.flags.length) {
			if(this.subcommands.length) {
				result += "\n\nФлаги:"
			}

			let tableLines: string[][] = this.flags.map((flag) => {
				let usage = " -" + flag.name
				if(flag.aliases.length) {
					usage += " (-" + flag.aliases.join(", -") + ")"
				}

				return [usage, flag.description || ""]
			})

			result += "\n" + new ConsoleTableDrawer({
				rowPadding: 1,
				lines: tableLines
			}).draw()
		}

		return result
	}

	protected autocompletePath(pathToComplete: string, base: string, extension?: string, options?: ConsoleAutocompleteOptions): string[] {

		let mapPath = pathToComplete.split("/")
		let search = base
		let incompletePathFragmentIndex = mapPath.length - 1

		for(let i = 0; i < incompletePathFragmentIndex; i++) {
			search = path.resolve(search, mapPath[i])
		}

		let incompletePathFragment = mapPath[incompletePathFragmentIndex]

		try {
			let autocompletes = []

			for(let file of fs.readdirSync(search)) {
				if(!file.startsWith(incompletePathFragment)) continue
				let autocompletion = file
				let stats = fs.statSync(path.resolve(search, file))
				let isDirectory = stats.isDirectory()

				if(!isDirectory && extension) {
					if (autocompletion.endsWith(extension)) {
						autocompletion = autocompletion.slice(0, -extension.length);
					} else {
						continue
					}
				}

				// Console will not display two autocompletes
                // if options.single is set.

                if(options.single && autocompletes.length) return []

				autocompletion = path.resolve(search, autocompletion)
				if(autocompletion.startsWith(base)) autocompletion = path.relative(base, autocompletion)

				autocompletes.push(autocompletion)
			}

			return autocompletes
		} catch(ignored) { return [] }
	}

    autocompleteFlags(flagToComplete: string, options: ConsoleAutocompleteOptions): string[] {

        flagToComplete = flagToComplete.substr(1)
	    let autocompletes = []

        for(let flag of this.flags) {
            if(flag.name.startsWith(flagToComplete)) {
                if(options.single && autocompletes.length) return []
                autocompletes.push("-" + flag.name)
            }
        }

        return autocompletes
    }
}