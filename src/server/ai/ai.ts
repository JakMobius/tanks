import Server from "../server";
import ServerGameWorld from "../server-game-world";
import ServerTank from "../entity/tank/server-tank";


export interface AIConfig {
	server: Server
	game: ServerGameWorld
	tank: ServerTank
}

export default class AI {
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