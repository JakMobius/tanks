

class GameClient {
	static globalId = 0

	id
	data
	connection
	game = null

	constructor(config) {
		config = config || {}
		this.id = GameClient.globalId++
		this.data = config.data || {}
		this.connection = config.connection
	}
}

module.exports = GameClient