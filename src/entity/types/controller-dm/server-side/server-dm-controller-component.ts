import ServerGameController, {ServerGameControllerConfig} from "src/server/room/game-modes/server-game-controller";
import {DMPlayerWaitingStateController} from "src/entity/types/controller-dm/server-side/dm-player-waiting-state";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";

export interface ServerDMControllerConfig extends ServerGameControllerConfig {
    minPlayers?: number
    matchTime?: number
    singlePlayerMatchTime?: number
    matchStartDelay?: number
    matchEndDelay?: number
}

export default class ServerDMControllerComponent extends ServerGameController {

    config: Required<ServerDMControllerConfig>

    constructor(config: ServerDMControllerConfig) {
        super(config)
        this.config = Object.assign({
            minPlayers: 4,
            matchTime: 305,
            matchStartDelay: 10,
            matchEndDelay: 10,
            singlePlayerMatchTime: 15
        }, config)

        this.world.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
        })

        this.activateGameState(new DMPlayerWaitingStateController(this))
    }
}