import CLIStyle from "./commands/cli-style";

const serverStartupTime = Date.now()

import Server from "./server";
import DB from './db/db';
import Logger from './log/logger';
import Console from './console/console';
import BootCommand from './commands/bootcommand';
import Preferences from './preferences/preferences';
import * as packageJson from '../../package.json';
import { URL } from 'url';

function initDatabase() {
    Logger.global.log("Connecting to database")
    DB.instance = new DB()

    return new Promise((resolve) => {
        const connect = () => {
            DB.instance.connect().then(resolve).catch((error) => {
                Logger.global.log("Failed to connect to database. Retrying in 5 seconds")
                Logger.global.log(error)
                setTimeout(connect, 5000)
            })
        }
        connect()
    })
}

async function configureClusterCommunication(server: Server) {
    if(Preferences.boolean("cluster.enabled")) {
        let clusterPortSettingPath = "cluster.hub-port"
        let clusterPort
        const clusterPortSetting = Preferences.value(clusterPortSettingPath)

        if(clusterPortSetting === "inherit-game-port") {
            clusterPort = server.clientPort
        } else {
            Preferences.validatePort(clusterPortSetting, clusterPortSettingPath)
            clusterPort = Number(clusterPortSetting)
        }

        server.setClusterPort(clusterPort)

        let hubUrl = new URL(Preferences.string("cluster.hub-address"))

        if(hubUrl.port === "") hubUrl.port = String(clusterPort)
        hubUrl.pathname = "/cluster-link"

        server.setSocketServerIP(hubUrl.href)

        server.setClusterPassword(Preferences.string("cluster.hub-access-key"))
    }
}

async function initialize() {

    await Preferences.read()

    const serverConsole = new Console()
    serverConsole.createWindow()
    Logger.global.log(`Loaded libraries within ${(Date.now() - serverStartupTime)/1000}s`)

    let server

    try {
        const bootCommand = new BootCommand({
            console: serverConsole
        })
        serverConsole.callHandle(bootCommand, process.argv)

        Preferences.override(bootCommand.preferencesOverride)

        await initDatabase()

        server = new Server()
        server.setClientPort(Preferences.port("port"))
        server.console = serverConsole
        serverConsole.server = server

        await configureClusterCommunication(server)

        bootCommand.runPostInit()
    } catch(e) {

        // Cleaning up everything that would cause program to stay active

        if(server) server.terminate()
        else if(serverConsole) serverConsole.window.screen.destroy()

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