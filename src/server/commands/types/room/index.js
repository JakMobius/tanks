const Command = require("../../command.js")
const RoomCreateCommand = require("./roomcreate")
const RoomListCommand = require("./roomlist")
const RoomViewCommand = require("./roomview")

class RoomCommand extends Command {

    constructor(options) {
        super(options);

        this.addSubcommand(new RoomCreateCommand(options))
        this.addSubcommand(new RoomListCommand(options))
        this.addSubcommand(new RoomViewCommand(options))
    }

    getDescription() {
        return "Управление игровыми комнатами"
    }

    getName() {
        return "room"
    }
}

module.exports = RoomCommand