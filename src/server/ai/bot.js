const Client = require("../client")
const AIConnection = require("./ai_connection")

class GameBot extends Client {
	constructor(config) {
		super(config)
		this.server = null
		this.lifetime = 1
		this.websocket = new AIConnection()
		this.server = null
		this.tankid = 7
		this.nick = null
		this.time = 0
		this.isBot = true
	}

	initAI(json) {

	}

	connectToRoom(room) {
		this.server.configureClient(this, room)
		this.websocket.tell({
			"cmd": "cfg",
			"t": this.tankid,
			"n": this.nick
		})

		this.websocket.tell({
			"cmd": "nhg"
		})

		this.alive = false
	}

	tick() {

		if(self.alive && self.data.player.tank.model.health <= 0) {
			self.alive = false

			self.ticksToRespawn = 40
		}

		if(!self.alive && self.data.player.tank.model.health > 0) {
			self.alive = true
		}

		if(self.ticksToRespawn > 0 || !self.alive) {
			self.ticksToRespawn--

			if(self.ticksToRespawn <= 0) {
				this.websocket.tell({
					 cmd: "spn"
				 })
			}


		}


	}
}

module.exports = GameBot