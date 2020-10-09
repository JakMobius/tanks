
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

        if(!this.console.server.socket) {
            logger.log("§F00;Для выполнения этой команды необходимо запустить игровой сокет")
            logger.log("§777; ⭑ §;Чтобы управлять модулями сервера, используйте команду service")
            return;
        }

        let found = this.findFlags(args)
        if(found.errors) {
            logger.log(found.errors.join("\n"))
            return
        }
        if(found.unknown.length) {
            logger.log("§FF0;Нeизвестные аргументы: " + found.unknown.join("\n"))
        }
        let flags = found.flags

        if(!flags.has("map")) {
            logger.log(this.getHelp())
            return
        }

        let mapName = flags.get("map")[0]
        let gameName = mapName
        if(flags.has("name")) gameName = flags.get("name")[0]

        if (this.console.server.socket.games.get(gameName)) {
            logger.log(
                "§F00;Ошибка: комната '" + gameName + "' уже существует\n" +
                "§777; ⭑ §;Чтобы управлять существующей комнатой, используйте room view\n" +
                "§777; ⭑ §;Чтобы удалить существующую комнату, используйте room delete"
            )
            return
        }

        let mapPath = path.resolve(mapFolder, mapName + ".map")

        if (!fs.existsSync(mapPath)) {
            logger.log("§F00;Ошибка: Карта '" + mapName + "' не существует")
            return
        }

        const gzip = fs.readFileSync(mapPath)
        const data = pako.inflate(gzip)
        const decoder = new BinaryDecoder({ largeIndices: true })
        decoder.reset()
        decoder.readData(data.buffer)

        const map = GameMap.fromBinary(decoder)

        const game = new Game({
            name: gameName,
            server: this.server,
            map: map
        })

        this.console.server.socket.games.set(gameName, game)

        logger.log("§0F0; Комната '" + gameName + "' создана")
        logger.log("§777; ⭑ §;Чтобы управлять комнатой, используйте 'room view " + gameName + "'")
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