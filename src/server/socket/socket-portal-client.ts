import AbstractConnection from "../../networking/abstract-connection";


class SocketPortalClient {
	static globalId = 0

	id: number
	data: any
	websocket: any
	connection: AbstractConnection

	game: any = null

	constructor(config: any) {
		config = config || {}
		this.id = SocketPortalClient.globalId++
		this.data = config.data || {}
		this.connection = config.connection
		this.websocket = config.websocket
	}
}

export default SocketPortalClient;