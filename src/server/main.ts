
const serverStartupTime = Date.now()

import CLIStyle from "./commands/cli-style";
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
            serverConsole.window.destroy()
            server.db.disconnect(false)
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
    Logger.global.log(
        `§0F0;Server v${packageJson.version} has been started successfully §444;(${(Date.now() - serverInitializeTime) / 1000}s)\n` +
        CLIStyle.tip("Type \"help\" for more information")
    )
}).catch(e => {
    console.error("Failed to start server")
    console.error(e)
})