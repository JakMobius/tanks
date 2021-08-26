

export interface CommandFlagConfig {
    /// Flag type
    type?: "key" | "flag"

    // Flag name
    name: string

    // Aliases for this flag (like -a for -all)
    aliases?: string[]

    // Human-readable description of this flag. Displayed in 'help' command
    description?: string
}

/**
 * Console command flag.
 * @example
 *
 *  // The following configuration will match
 *  // "-n" flag in command:
 *  // room create empty -n "Empty Room"
 *
 *  new CommandFlag({
 *      type: "key",
 *      name: "name",
 *      aliases: ["n"],
 *      description: "Room name"
 *  })
 */

class CommandFlag {

    constructor(options: CommandFlagConfig) {
        this.type = options.type || "flag"
        this.name = options.name
        this.aliases = options.aliases || []
        this.description = options.description
    }

    aliases: string[];
    description?: string;
    name: string;
    type: "key" | "flag";
}

export default CommandFlag;