

class GameClient {
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
		this.id = GameClient.globalId++
		this.data = config.data || {}
		this.connection = config.connection
		this.websocket = config.websocket
	}
}

module.exports = GameClient