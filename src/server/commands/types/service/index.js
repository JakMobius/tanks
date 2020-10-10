const Command = require("../../command.js")

class ServiceCommand extends Command {

    constructor(options) {
        super(options);

        this.actions = new Map([
            ["on", {
                hubPage: true,
                gamePage: true,
                rooms: true
            }],
            ["hub-only", {
                hubPage: true,
                gamePage: false,
                rooms: false
            }],
            ["game-only", {
                hubPage: false,
                gamePage: true,
                rooms: true
            }],
            ["socket-only", {
                hubPage: false,
                gamePage: false,
                rooms: true
            }]
        ])

    }

    onTabComplete(args) {
        if(args.length > 1) return []
        let last = args[0]

        return Array.from(this.actions.keys()).filter(a => a.startsWith(last))
    }

    onPerform(args) {
        if(args.length !== 1 || !this.actions.has(args[0])) {
            this.console.logger.log(this.getHelp())
            return;
        }

        let server = this.console.server
        let config = this.actions.get(args[0])

        server.setHubPageActive(config.hubPage)
        server.setGamePageActive(config.gamePage)
        server.setRoomsActive(config.rooms)
    }

    getDescription() {
        return "Switch server operation modes"
    }

    getUsage() {
        return "service <" + Array.from(this.actions.keys()).join("|") + ">"
    }

    getName() {
        return "service"
    }

    getHelp() {
        return super.getHelp() + "\n" +
        " - service on          - all services are enabled\n" +
        " - service hub-only    - disallow game rooms and discard \"/game\" page requests\n" +
        " - service game-only   - discard \"/hub\" page requests\n" +
        " - service socket-only - disable http server, run as websocket only"
    }
}

module.exports = ServiceCommand