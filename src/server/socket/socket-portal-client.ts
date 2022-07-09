import Connection from "../../networking/connection";
import Room from "../room/room";
import TypedEventHandler from "../../utils/typed-event-handler";

export interface SocketPortalClientConfig<DataClass> {
	data: DataClass
	connection: Connection
}

export default class SocketPortalClient<DataClass = any> extends TypedEventHandler {
	static globalId = 0

	id: number
	data: DataClass
	connection: Connection

	game: Room = null

	constructor(config?: SocketPortalClientConfig<DataClass>) {
		super()
		this.id = SocketPortalClient.globalId++
		this.data = config.data
		this.connection = config.connection
	}
}