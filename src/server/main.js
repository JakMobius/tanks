
/*
  Allow to require entire folders with require("/src/some/folder/with/modules/")
 */
require("../utils/node-folderify")

const DB = require("./db/db")
const Logger = require("./log/logger")
const Console = require("./console/console")
const BootCommand = require("./commands/bootcommand")
const Chalk = require("chalk")
const Server = require("./server")
const Preferences = require("./preferences/preferences")
const packageJson = require('../../package.json');

async function initialize() {

    await Preferences.read()

    const console = new Console()
    console.createWindow()

    const bootCommand = new BootCommand({ console: console })
    console.callHandle(bootCommand, process.argv)

    const port = Preferences.value("port")

    if(!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new Error("port setting should be integer in 0...65535 range")
    }

    Logger.global.log("Connecting to database")

    DB.instance = new DB()
    try {
        await DB.instance.connect()
    } catch(error) {
        Logger.global.log("Failed to connect to database")
        Logger.global.log(error)
    }

    const server = new Server()
    server.bindPort(port)
    console.server = server
    bootCommand.runPostInit()
}

const time = Date.now()

initialize().catch(err => {
    console.error("Failed to start server")
    console.error(err)
    process.exit(0)
}).then(() => {
    Logger.global.log(
        `§0F0;Server v${packageJson.version} has been started successfully §444;(${(Date.now() - time) / 1000}s)\n` +
        `"777; ⭑ §;Type \"help\" for more information`
    )
})

