import ServerGameController from "src/server/room/game-modes/server-game-controller";
import { DMPlayerWaitingStateController } from "src/entity/types/controller-dm/server-side/dm-player-waiting-state";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import Entity from "src/utils/ecs/entity";
import { VectorParameter, ParameterInspector } from "src/entity/components/inspector/entity-inspector";

export interface ServerDMControllerConfig {
    minPlayers?: number
    matchTime?: number
    singlePlayerMatchTime?: number
    matchStartDelay?: number
    matchEndDelay?: number
}

export default class ServerDMControllerComponent extends ServerGameController {

    config: Required<ServerDMControllerConfig>

    constructor() {
        super()
        this.config = {
            minPlayers: 4,
            matchTime: 305,
            matchStartDelay: 10,
            matchEndDelay: 10,
            singlePlayerMatchTime: 15
        }

        this.worldEventHandler.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
        })

        this.eventHandler.on("inspector-added", (inspector: ParameterInspector) => {
            inspector.addParameter(new VectorParameter(1)
                .withName("Продолжительность матча")
                .withGetter(() => [this.config.matchTime])
                .withSetter((time) => this.config.matchTime = time[0])
                .replaceNaN()
                .requirePositive()
            )

            inspector.addParameter(new VectorParameter(1)
                .withName("Задержка до начала матча")
                .withGetter(() => [this.config.matchStartDelay])
                .withSetter((time) => this.config.matchStartDelay = time[0])
                .replaceNaN()
                .requirePositive()
            )

            inspector.addParameter(new VectorParameter(1)
                .withName("Задержка до перезапуска матча")
                .withGetter(() => [this.config.matchEndDelay])
                .withSetter((time) => this.config.matchEndDelay = time[0])
                .replaceNaN()
                .requirePositive()
            )

            inspector.addParameter(new VectorParameter(1)
                .withName("Задержка победы без соперников")
                .withGetter(() => [this.config.singlePlayerMatchTime])
                .withSetter((time) => this.config.singlePlayerMatchTime = time[0])
                .replaceNaN()
                .requirePositive()
            )
        })
    }

    setWorld(world: Entity): void {
        this.activateGameState(null)
        super.setWorld(world)
        if (world) this.activateGameState(new DMPlayerWaitingStateController(this))
    }
}