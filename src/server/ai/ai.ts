import Server from "../server";
import ServerGameWorld from "../server-game-world";
import EntityModel from "../../entity/entity-model";

export interface AIConfig {
	server: Server
	game: ServerGameWorld
	tank: EntityModel
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