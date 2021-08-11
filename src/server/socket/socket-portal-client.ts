import Connection from "../../networking/connection";
import Room from "../room/room";

export interface SocketPortalClientConfig<DataClass> {
	data: DataClass
	connection: Connection
}

export default class SocketPortalClient<DataClass = any> {
	static globalId = 0

	id: number
	data: DataClass
	connection: Connection

	game: Room = null

	constructor(config?: SocketPortalClientConfig<DataClass>) {
		this.id = SocketPortalClient.globalId++
		this.data = config.data
		this.connection = config.connection
	}
}