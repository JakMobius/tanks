
/*
  Allow to require entire folders with require("/src/some/folder/with/modules/")
 */
require("../utils/node-folderify")

const GameSocket = require("./gamesocket")
const Hub = require("./hub/hub")
const DB = require("./db/db")
const Logger = require("./log/logger")
const Console = require("./console/console")
const BootCommand = require("./commands/bootcommand")
const Chalk = require("chalk")
const HTTP = require('http');

async function asyncImmediate(callback) {
    return new Promise((resolve, reject) => (
        setImmediate(() => {
            callback()
            resolve()
        })
    ))
}

async function initialize() {

    const console = new Console()
    console.createWindow()

    const bootCommand = new BootCommand({ console: console })
    console.callHandle(bootCommand, process.argv)

    Logger.global.log("Подключение к базе данных...")

    DB.instance = new DB()
    try {
        await DB.instance.connect()
    } catch(error) {
        Logger.global.log("Не удалось подключиться к базе данных")
    }

    Logger.global.log("Привязка к порту...")

    let server
    await asyncImmediate(() => {
        server = HTTP.createServer()
        server.listen(25565)
    })

    Logger.global.log("Активация игрового сокета...")

    let socket
    await asyncImmediate(() => {
        socket = new GameSocket();
        console.server = socket

        socket.listen(server)
    })

    Logger.global.log("Активация HTTP-сервера...")

    let hub
    await asyncImmediate(() => {
        hub = new Hub()
        hub.listen(server)
    })

    bootCommand.runPostInit()
}

const time = Date.now()
initialize().then(() => {
    Logger.global.log(Chalk.greenBright("Сервер загружен успешно") + Chalk.gray(" (" + (Date.now() - time) / 1000 + "s)"))
})

