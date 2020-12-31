

class SocketPortalClient {
	static globalId = 0

	id
	data
	websocket
	connection

	/**
	 * @type {Room}
	 */
	game = null

	constructor(config) {
		config = config || {}
		this.id = SocketPortalClient.globalId++
		this.data = config.data || {}
		this.connection = config.connection
		this.websocket = config.websocket
	}
}

export default SocketPortalClient;