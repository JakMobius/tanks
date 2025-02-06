import Command, {CommandConfig} from '../command';
import RoomCreateCommand from './room/roomcreate';
import RoomListCommand from './room/roomlist';
import RoomViewCommand from './room/roomview';

export default class RoomCommand extends Command {

    constructor(options: CommandConfig) {
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