
const Command = require("../../command")

class RoomViewCommand extends Command {
    onPerform(args) {
        let logger = this.console.logger
        if (args.length !== 1) {
            logger.log(this.getHelp())
            return
        }

        let id = args[0]
        let world = this.console.server.games.get(id)

        if (!world) {
            logger.log("Комнаты '" + id + "' не существует")
            return
        }

        this.console.observingRoom = world
        this.console.window.setPrompt(id)
        this.console.switchToLogger(world.logger)
        this.console.window.render()
    }

    onTabComplete(args) {
        if(args.length === 1) {
            let result = []

            for(let game of this.console.server.games.keys()) {
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
        return "Переключиться на комнату"
    }
}

module.exports = RoomViewCommand