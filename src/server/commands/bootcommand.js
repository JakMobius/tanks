
const Command = require("./command")
const CommandFlag = require("./commandflag")

class BootCommand extends Command {

    constructor(options) {
        super(options);

        this.addFlag(new CommandFlag({
            type: "key",
            name: "script",
            aliases: ["s"],
            description: "Run script(-s) after server start"
        }))

        this.parsedFlags = null
    }

    onPerform(args) {
        let flags = this.findFlags(args.slice(2))
        if(flags.errors) {
            console.log(flags.errors.join("\n"))
            process.exit(-1)
        }

        this.parsedFlags = flags.flags
    }

    runPostInit() {
        let scripts = this.parsedFlags.get("script")
        if(scripts) {
            for(let script of scripts) {
                this.console.runScript(script)
            }
        }
    }

    getName() {
        return "Server boot command";
    }
}

module.exports = BootCommand