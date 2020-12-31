

class AI {
	public server: any;
	public game: any;
	public tank: any;

	constructor(config) {
		this.server = config.server
		this.game = config.game
		this.tank = config.tank
	}

	tick() {

	}
}

export default AI;