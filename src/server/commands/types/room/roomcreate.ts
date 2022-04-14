
import Command, {CommandConfig} from '../../command';
import CommandFlag from '../../command-flag';
import fs from 'fs';
import path from 'path';
import RoomConfig from "../../../room/room-config";
import {ConsoleAutocompleteOptions} from "../../../console/console";
import CLIStyle from "../../cli-style";

const mapFolder = path.resolve(__dirname, "resources/maps")

class RoomCreateCommand extends Command {

    constructor(options: CommandConfig) {
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

    onPerform(args: string[]) {
        let logger = this.console.logger

        if(!this.console.server.gameSocket) {
            logger.log("§F00;This command requires game socket to be running")
            logger.log(CLIStyle.tip("To manage server modules, use 'service' command"))
            return;
        }

        let found = this.findFlags(args)
        this.logFlagErrors(found, logger)

        let flags = found.flags

        if(!flags.has("map")) {
            logger.log(this.getHelp())
            return
        }

        let mapName = (flags.get("map") as string[])[0]
        let gameName = mapName
        if(flags.has("name")) gameName = (flags.get("name") as string[])[0]

        if (this.console.server.gameSocket.games.get(gameName)) {
            logger.log( `§F00; Room '${gameName}' already exists\n` +
                        CLIStyle.tip(`To control existing room, use 'room view' command\n`) +
                        CLIStyle.tip(`To delete existing room, use 'room delete' command`))
            return
        }

        let mapPath = path.resolve(mapFolder, mapName + ".map")

        if (!fs.existsSync(mapPath)) {
            logger.log("§F00;No such map: '" + mapName + "'")
            return
        }

        let roomConfig = new RoomConfig()

        roomConfig.name = gameName
        roomConfig.map = mapPath

        this.console.server.gameSocket.createRoom(roomConfig).then(() => {
            logger.log( `§0F0; Room '${gameName}' has been sucessfully created\n` +
                    CLIStyle.tip(`To control this room, use 'room view "${gameName}"' command`))
        })
    }

    onTabComplete(args: string[], options: ConsoleAutocompleteOptions) {
        let found = this.findFlags(args)

        let currentFlag = found.currentFlag

        if(currentFlag && currentFlag.name === "map") {
            return this.autocompletePath(args[args.length - 1], mapFolder, ".map", options)
        } else if(found.incompleteFlag) {
            return super.autocompleteFlags(found.incompleteFlag, options)
        } else {
            return []
        }
    }

    getName() {
        return "create"
    }

    getDescription() {
        return "Создать комнату"
    }
}

export default RoomCreateCommand;