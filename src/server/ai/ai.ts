import Server from "../server";
import Entity from "src/utils/ecs/entity";

export interface AIConfig {
	server: Server
	game: Entity
	tank: Entity
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