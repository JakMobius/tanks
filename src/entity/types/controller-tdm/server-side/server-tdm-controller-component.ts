import { TDMPlayerWaitingStateController } from "src/entity/types/controller-tdm/server-side/tdm-player-waiting-state";
import ServerTeamedGameController, {
    ServerTeamedGameControllerConfig
} from "src/server/room/game-modes/server-teamed-game-controller";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import Entity from "src/utils/ecs/entity";
import { VectorParameter, ParameterInspector } from "src/entity/components/inspector/entity-inspector";

export interface ServerTDMControllerConfig extends ServerTeamedGameControllerConfig {
    minPlayers?: number
    matchTime?: number
    singleTeamMatchTime?: number
    matchStartDelay?: number
    matchEndDelay?: number
}

export default class ServerTDMControllerComponent extends ServerTeamedGameController {

    config: Required<ServerTDMControllerConfig>

    constructor() {
        let fullConfig = {
            minPlayers: 4,
            teams: 2,
            matchTime: 305,
            matchStartDelay: 10,
            matchEndDelay: 10,
            singleTeamMatchTime: 15
        } satisfies ServerTDMControllerConfig

        super(fullConfig)
        this.config = fullConfig

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
                .withGetter(() => [this.config.singleTeamMatchTime])
                .withSetter((time) => this.config.singleTeamMatchTime = time[0])
                .replaceNaN()
                .requirePositive()
            )
        })
    }

    setWorld(world: Entity): void {
        this.activateGameState(null)
        super.setWorld(world)
        if (world) this.activateGameState(new TDMPlayerWaitingStateController(this))
    }
}