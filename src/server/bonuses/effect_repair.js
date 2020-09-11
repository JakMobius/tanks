const Effect = require('./effect');

class EffectRepair {
	constructor() {
		this.type = {
			name : "repair",
			explodes : true,
			explodePower : 3,
			id: 6
		}
	}

	start(player) {
		this.player = player
		this.player.tank.model.health = this.player.tank.constructor.getMaximumHealth()
		this.player.tank.alive = true
	}

	tick() {

	}

	end() {

	}
}
