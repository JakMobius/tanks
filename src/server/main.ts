
const serverStartupTime = Date.now()

import Server from "./server";
import Logger from './log/logger';
import Console from './console/console';
import BootCommand from './commands/boot-command';
import Preferences from './preferences/preferences';
import * as packageJson from '../../package.json';

async function initialize() {

    let server: Server
    let serverConsole: Console

    try {

        await Preferences.read()

        serverConsole = new Console()
        serverConsole.createWindow()
        Logger.global.log(`Loaded libraries within ${(Date.now() - serverStartupTime)/1000}s`)

        const preferences = Preferences.root
        const bootCommand = new BootCommand({
            console: serverConsole
        })

        serverConsole.callHandle(bootCommand, process.argv)
        if(bootCommand.preferencesOverride.errors.length) {
            throw bootCommand.preferencesOverride.errors
        }
        preferences.override(bootCommand.preferencesOverride.overrides)

        const config = Server.configParser(preferences)
        await config.database.connect()

        server = new Server(config)
        server.setConsole(serverConsole)

        server.on("terminate", () => {
            serverConsole.destroy()
        })

        bootCommand.runPostInit()
    } catch(e) {

        // Cleaning up everything that would cause program to stay active

        if(server) server.terminate().then()
        else if(serverConsole) serverConsole.destroy()

        throw e
    }
}


const serverInitializeTime = Date.now()

initialize().then(() => {
    let billboard = 
        ".----------------------------.\n" +
        "|  _____           _         |\n" +
        "| |_   _|_ _ _ __ | | _____  |\n" +
        "|   | |/ _` | '_ \\| |/ / __| |\n" +
        "|   | | (_| | | | |   <\\__ \\ |\n" +
        "|   |_|\\__,_|_| |_|_|\\_\\___/ |\n" +
        "'----------------------------'"
    Logger.global.log(billboard)
    let startupTime = (Date.now() - serverInitializeTime) / 1000
    Logger.global.log(`§0F0;Booted up tanks v${packageJson.version}. Type "help". §444;(${startupTime}s)\n`)
}).catch(e => {
    console.error("Failed to start server")
    console.error(e)
})