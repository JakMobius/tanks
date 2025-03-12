import Command, { CommandConfig } from '../command';
import RoomCreateCommand from './room/roomcreate';
import RoomListCommand from './room/roomlist';
import RoomViewCommand from './room/roomview';

export default class RoomCommand extends Command {

    constructor(config: CommandConfig) {
        super(config);

        this.addSubcommand(new RoomCreateCommand(config))
        this.addSubcommand(new RoomListCommand(config))
        this.addSubcommand(new RoomViewCommand(config))
    }

    getDescription() {
        return "Управление игровыми комнатами"
    }

    getName() {
        return "room"
    }
}