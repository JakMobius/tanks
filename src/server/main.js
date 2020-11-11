
/*
  Allow to require entire folders with require("/src/some/folder/with/modules/")
 */
require("../utils/node-folderify")

const DB = require("./db/db")
const Logger = require("./log/logger")
const Console = require("./console/console")
const BootCommand = require("./commands/bootcommand")
const Server = require("./server")
const Preferences = require("./preferences/preferences")
const packageJson = require('../../package.json');
const url = require("url");

async function initDatabase() {
    Logger.global.log("Connecting to database")

    if(Preferences.boolean("database.enabled")) {
        DB.instance = new DB()
        try {
            await DB.instance.connect()
        } catch (error) {
            Logger.global.log("Failed to connect to database")
            Logger.global.log(error)
        }
    }
}

async function configureClusterCommunication(server) {
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

        let hubUrl = new url.URL(Preferences.string("cluster.hub-address"))

        if(hubUrl.port === "") hubUrl.port = String(clusterPort)
        hubUrl.pathname = "/cluster-link"

        server.setSocketServerIP(hubUrl.href)
    }
}

async function initialize() {

    await Preferences.read()

    const serverConsole = new Console()
    serverConsole.createWindow()

    try {
        const bootCommand = new BootCommand({
            console: serverConsole
        })
        serverConsole.callHandle(bootCommand, process.argv)

        Preferences.override(bootCommand.preferencesOverride)

        await initDatabase()

        const port = Preferences.port("port")
        const server = new Server()
        server.setClientPort(port)
        server.console = serverConsole
        serverConsole.server = server

        await configureClusterCommunication(server)

        bootCommand.runPostInit()
    } catch(e) {
        serverConsole.window.screen.destroy()
        throw e
    }
}

const time = Date.now()

initialize().then(() => {
    Logger.global.log(
        `§0F0;Server v${packageJson.version} has been started successfully §444;(${(Date.now() - time) / 1000}s)\n` +
        `"777; ⭑ §;Type \"help\" for more information`
    )
}).catch(e => {
    console.error("Failed to start server")
    console.error(e)
})

