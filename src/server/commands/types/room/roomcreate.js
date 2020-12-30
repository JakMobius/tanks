
const Command = require("../../command")
const CommandFlag = require("../../commandflag")
const Game = require("/src/server/room/game.js")
const fs = require("fs")
const GameMap = require("/src/utils/map/gamemap")
const BinaryDecoder = require("/src/serialization/binary/binarydecoder")
const pako = require("pako")
const path = require("path")

const mapFolder = path.resolve(__dirname, "../../../maps")

class RoomCreateCommand extends Command {

    constructor(options) {
        super(options);

        this.addFlag(new CommandFlag({
            type: "key",
            name: "name",
            aliases: ["n"],
            description: "Название комнаты"
        }))

        this.addFlag(new CommandFlag({
                type: "key",
                name: "map",
                aliases: ["m"],
                description: "Путь к файлу с картой (обязательно)"
        }))
    }

    onPerform(args) {
        let logger = this.console.logger

        if(!this.console.server.gameSocket) {
            logger.log("§F00;This command requires game socket to be running")
            logger.log("§777; ⭑ §;To manage server modules, use 'service' command")
            return;
        }

        let found = this.findFlags(args)
        this.logFlagErrors(found, logger)

        let flags = found.flags

        if(!flags.has("map")) {
            logger.log(this.getHelp())
            return
        }

        let mapName = flags.get("map")[0]
        let gameName = mapName
        if(flags.has("name")) gameName = flags.get("name")[0]

        if (this.console.server.gameSocket.games.get(gameName)) {
            logger.log( `§F00; Room '" + gameName + "' already exists\n` +
                        `§777; ⭑ §;To control existing room, use 'room view' command\n` +
                        `§777; ⭑ §;To delete existing room, use 'room delete' command`)
            return
        }

        let mapPath = path.resolve(mapFolder, mapName + ".map")

        if (!fs.existsSync(mapPath)) {
            logger.log("§F00;No such map: '" + mapName + "'")
            return
        }



        logger.log( `§0F0; Room '${gameName}' has been sucessfully created")\n` +
                    `§777; ⭑ §;To control this room, use 'room view "${gameName}"' command`)
    }

    onTabComplete(args) {
        let found = this.findFlags(args)
        let currentFlag = found.currentFlag

        if(!currentFlag) return []
        if(currentFlag.name === "map") {
            let last = args[args.length - 1]
            let mapPath = last.split("/")
            let search = mapFolder
            let l = mapPath.length - 1

            for(let i = 0; i < l; i++) {
                search = path.resolve(search, mapPath[i])
            }

            let unfinished = mapPath[l]

            try {
                let result = []

                for(let file of fs.readdirSync(search)) {
                    if(!file.startsWith(unfinished)) continue
                    let name = file
                    let stats = fs.statSync(path.resolve(search, name))
                    let isDirectory = stats.isDirectory()

                    if(!isDirectory) {
                        if (name.endsWith(".map")) {
                            name = name.slice(0, -4);
                        } else {
                            continue
                        }
                    }

                    name = path.resolve(search, name)
                    if(name.startsWith(mapFolder)) name = path.relative(mapFolder, name)

                    result.push(name)
                }

                return result
            } catch(ignored) { return [] }
        }

        return []
    }

    getName() {
        return "create"
    }

    getDescription() {
        return "Создать комнату"
    }
}

module.exports = RoomCreateCommand