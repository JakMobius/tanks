import Command, {CommandConfig} from '../../command';
import {ConsoleAutocompleteOptions} from "../../../console/console";

export interface ServerServiceConfig {
    hubPage: boolean
    gamePage: boolean
    rooms: boolean
}

class ServiceCommand extends Command {
	public actions: Map<string, ServerServiceConfig>;

    constructor(options: CommandConfig) {
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

    onTabComplete(args: string[], options: ConsoleAutocompleteOptions): string[] {
        if(args.length > 1) return []
        let last = args[0]

        return Array.from(this.actions.keys()).filter(a => a.startsWith(last))
    }

    onPerform(args: string[]) {
        if(args.length !== 1 || !this.actions.has(args[0])) {
            this.console.logger.log(this.getHelp())
            return;
        }

        let server = this.console.server
        let config = this.actions.get(args[0])

        server.setHubPageActive(config.hubPage)
        server.setGamePageActive(config.gamePage)
        server.setGameSocketActive(config.rooms)
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
        " - service socket-only - disable http server, run as websocketConnection only"
    }
}

export default ServiceCommand;