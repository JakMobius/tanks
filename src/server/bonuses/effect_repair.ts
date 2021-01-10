import Effect from './effect';
import Player from "../../utils/player";

class EffectRepair {
	public type: any;
	public player: any;

	constructor() {
		this.type = {
			name : "repair",
			explodes : true,
			explodePower : 3,
			id: 6
		}
	}

	start(player: Player) {
		this.player = player
		this.player.tank.model.health = this.player.tank.constructor.getMaximumHealth()
		this.player.tank.alive = true
	}

	tick() {

	}

	end() {

	}
}
