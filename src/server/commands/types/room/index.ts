import Command, {CommandConfig} from '../../command';
import RoomCreateCommand from './roomcreate';
import RoomListCommand from './roomlist';
import RoomViewCommand from './roomview';

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