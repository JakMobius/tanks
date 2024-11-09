import {CTFPlayerWaitingStateController} from "src/entity/types/controller-ctf/server-side/ctf-player-waiting-state";
import ServerTeamedGameController, {
    ServerTeamedGameControllerConfig
} from "src/server/room/game-modes/server-teamed-game-controller";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";

export interface ServerCTFControllerConfig extends ServerTeamedGameControllerConfig {
    minPlayers?: number
    matchTime?: number
    singlePlayerMatchTime?: number
    matchStartDelay?: number
    matchEndDelay?: number
}

export default class ServerCTFControllerComponent extends ServerTeamedGameController {

    config: Required<ServerCTFControllerConfig>

    constructor(config: ServerCTFControllerConfig) {
        let fullConfig = Object.assign({
            minPlayers: 4,
            matchTime: 305,
            matchStartDelay: 10,
            matchEndDelay: 10,
            singlePlayerMatchTime: 15,
            teams: 2
        }, config)

        super(fullConfig)
        this.config = fullConfig

        this.world.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
        })

        this.activateGameState(new CTFPlayerWaitingStateController(this))
    }
}