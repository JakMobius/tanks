import BinaryPacket from './binary-packet';
import Connection from "./connection";
import TypedEventHandler from "../utils/typed-event-handler";

export default class ConnectionClient<ConnectionClass extends Connection = Connection> extends TypedEventHandler {
    protected connected: boolean = false
    public connection: ConnectionClass

    constructor(connection: ConnectionClass) {
        super()
        this.connection = connection
        this.connection.on("incoming-packet", (packet) => this.handlePacket(packet))
    }

    handlePacket(packet: BinaryPacket) {
        this.emit(packet)
    }
}