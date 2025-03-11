import Command, {CommandConfig} from '../../command';
import CommandFlag from '../../command-flag';
import fs from 'fs';
import path from 'path';
import RoomConfig from "src/server/room/room-config";
import {ConsoleAutocompleteOptions} from "src/server/console/console";

export default class RoomCreateCommand extends Command {

    static validModes = [
        "CTF", "TDM", "DM", "FR"
    ]

    constructor(options: CommandConfig) {
        super(options);

        this.addFlag(new CommandFlag({
            type: "key",
            name: "name",
            aliases: ["n"],
            description: "Map name"
        }))

        this.addFlag(new CommandFlag({
            type: "key",
            name: "mode",
            aliases: ["mode"],
            description: "Game mode"
        }))

        this.addFlag(new CommandFlag({
            type: "key",
            name: "map",
            aliases: ["m"],
            description: "Path to the map file (required)"
        }))
    }

    onPerform(args: string[]) {
        let logger = this.console.logger

        if(!this.console.server.gameSocket) {
            logger.log("§F00;This command requires game socket to be running")
            return;
        }

        let found = this.findFlags(args)
        this.logFlagErrors(found, logger)

        let flags = found.flags

        if(!flags.has("map")) {
            logger.log(this.getHelp())
            return
        }

        let mode = (flags.get("mode") as string[])?.[0] ?? "FR"
        let mapName = (flags.get("map") as string[])[0]
        let gameName = mapName
        if(flags.has("name")) gameName = (flags.get("name") as string[])[0]

        if (this.console.server.gameSocket.games.get(gameName)) {
            logger.log( `§F00;Room '${gameName}' already exist\n`)
            return
        }

        let mapsDirectory = this.console.server.config.general.mapsDirectory
        let mapPath = path.resolve(mapsDirectory, mapName + ".json")

        if (!fs.existsSync(mapPath)) {
            logger.log("§F00;No such map: '" + mapName + "'")
            return
        }

        let roomConfig = new RoomConfig()

        roomConfig.name = gameName
        roomConfig.map = mapPath
        roomConfig.mode = mode

        this.console.server.gameSocket.createRoom(roomConfig).then(() => {
            logger.log(`§0F0; Created room '${gameName}'`)
        })
    }

    onTabComplete(args: string[], options: ConsoleAutocompleteOptions) {
        let found = this.findFlags(args)

        let currentFlag = found.currentFlag

        if(currentFlag?.name === "map") {
            let mapsDirectory = this.console.server.config.general.mapsDirectory
            return this.autocompletePath(args[args.length - 1], mapsDirectory, ".json", options)
        } else if(currentFlag?.name === "mode") {
            return RoomCreateCommand.validModes.filter(mode => mode.startsWith(args[args.length - 1].toUpperCase()))
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
        return "Create room"
    }
}