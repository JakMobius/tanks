import Command from '../../command';
import Game from "../../../room/game";
import {ConsoleAutocompleteOptions} from "../../../console/console";

class RoomViewCommand extends Command {
    onPerform(args: string[]) {
        let logger = this.console.logger
        if (args.length !== 1) {
            logger.log(this.getHelp())
            return
        }

        let id = args[0]
        let world = this.console.server.gameSocket.games.get(id) as Game

        if (!world) {
            logger.log("No such room: '" + id)
            return
        }

        this.console.observingRoom = world
        this.console.window.setPrompt(id)
        this.console.switchToLogger(world.logger)
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

export default RoomViewCommand;