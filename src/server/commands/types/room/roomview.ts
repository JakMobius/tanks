import Command from '../../command';
import {ConsoleAutocompleteOptions} from "src/server/console/console";

export default class RoomViewCommand extends Command {
    onPerform(args: string[]) {
        let logger = this.console.logger
        if (args.length !== 1) {
            logger.log(this.getHelp())
            return false
        }

        let id = args[0]
        let world = this.console.server.gameSocket.games.get(id)

        if (!world) {
            logger.log("No such room: '" + id + "'")
            return false
        }

        this.console.observingRoom = world
        this.console.window.setPrompt("(" + id + ")")

        return true
    }

    onTabComplete(args: string[], options: ConsoleAutocompleteOptions) {
        if(args.length === 1) {
            let result = []

            for(let game of this.console.server.gameSocket.games.keys()) {
                if(game.startsWith(args[0])) {
                    result.push(game)
                }
            }

            return result
        }

        return []
    }

    getUsage() {
        return "room view <id>"
    }

    getName() {
        return "view"
    }

    getDescription() {
        return "Switch to room"
    }
}