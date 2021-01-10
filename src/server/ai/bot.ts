import SocketPortalClient from '../socket/socket-portal-client';
import AIConnection from './ai_connection';
import Server from "../server";
import Room from "../room/room";

export interface GameBotConfig {
	server: Server;
	lifetime: number;
	tankid: number;
	nick: string;
	time: number;
	isBot: boolean;
	alive: boolean;
}

class GameBot extends SocketPortalClient {
	public server: Server;
	public lifetime: number;
	public tankid: number;
	public nick: string;
	public time: number;
	public isBot: boolean;
	public alive: boolean;
	public ticksToRespawn: number

	constructor(config?: GameBotConfig) {
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

	initAI(json: any) {

	}

	connectToRoom(room: Room) {
		this.server.gameSocket.configureClient(this, room)
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

		if(this.alive && this.data.player.tank.model.health <= 0) {
			this.alive = false

			this.ticksToRespawn = 40
		}

		if(!this.alive && this.data.player.tank.model.health > 0) {
			this.alive = true
		}

		if(this.ticksToRespawn > 0 || !this.alive) {
			this.ticksToRespawn--

			if(this.ticksToRespawn <= 0) {
				this.websocket.tell({
					 cmd: "spn"
				 })
			}
		}
	}
}

export default GameBot;