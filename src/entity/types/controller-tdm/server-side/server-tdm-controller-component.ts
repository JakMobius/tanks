import {TDMPlayerWaitingStateController} from "src/entity/types/controller-tdm/server-side/tdm-player-waiting-state";
import ServerTeamedGameController, {
    ServerTeamedGameControllerConfig
} from "src/server/room/game-modes/server-teamed-game-controller";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";

export interface ServerTDMControllerConfig extends ServerTeamedGameControllerConfig {
    minPlayers?: number
    matchTime?: number
    singleTeamMatchTime?: number
    matchStartDelay?: number
    matchEndDelay?: number
}

export default class ServerTDMControllerComponent extends ServerTeamedGameController {

    config: Required<ServerTDMControllerConfig>

    constructor(config: ServerTDMControllerConfig) {
        let fullConfig = Object.assign({
            minPlayers: 4,
            teams: 2,
            matchTime: 305,
            matchStartDelay: 10,
            matchEndDelay: 10,
            singleTeamMatchTime: 15
        }, config)

        super(fullConfig)
        this.config = fullConfig

        this.world.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
        })

        this.activateGameState(new TDMPlayerWaitingStateController(this))
    }
}