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

    /**
     * Flag type.
     * @type {"flag"|"key"}
     */
    type

    /**
     * This flag name
     * @type {string}
     */
    name

    /**
     * Aliases for this flag (like -a for -all)
     * @type {string[]}
     */
    aliases = []

    /**
     * Human-readable description of this flag. Displayed in 'help' command
     * @type {string|null}
     */
    description

    /**
     * @param {Object} options
     * @param {"flag"|"key"} options.type Type of flag
     * @param {string} options.name Flag name
     * @param {string[]} [options.aliases] Flag aliases
     * @param {string} [options.description] Human-readable description of this flag for console help command
     */

    constructor(options) {
        this.type = options.type || "flag"
        this.name = options.name
        this.aliases = options.aliases || []
        this.description = options.description
    }
}

module.exports = CommandFlag