import Server from "../server";
import ServerGameWorld from "../servergameworld";
import ServerTank from "../tanks/servertank";


export interface AIConfig {
	server: Server
	game: ServerGameWorld
	tank: ServerTank
}

class AI {
	public server: any;
	public game: any;
	public tank: any;

	constructor(config: AIConfig) {
		this.server = config.server
		this.game = config.game
		this.tank = config.tank
	}

	tick() {

	}
}

export default AI;