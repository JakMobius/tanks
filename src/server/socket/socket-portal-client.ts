import AbstractConnection from "../../networking/abstract-connection";
import Room from "../room/room";

export interface SocketPortalClientConfig<DataClass> {
	data: DataClass
	connection: AbstractConnection
}

export default class SocketPortalClient<DataClass = any> {
	static globalId = 0

	id: number
	data: DataClass
	connection: AbstractConnection

	game: Room = null

	constructor(config?: SocketPortalClientConfig<DataClass>) {
		this.id = SocketPortalClient.globalId++
		this.data = config.data
		this.connection = config.connection
	}
}