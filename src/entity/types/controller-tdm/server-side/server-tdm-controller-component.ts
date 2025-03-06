import { TDMPlayerWaitingStateController } from "src/entity/types/controller-tdm/server-side/tdm-player-waiting-state";
import ServerTeamedGameController, {
    ServerTeamedGameControllerConfig
} from "src/server/room/game-modes/server-teamed-game-controller";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import Entity from "src/utils/ecs/entity";
import { VectorProperty, PropertyInspector } from "src/entity/components/inspector/property-inspector";

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
            singleTeamMatchTime: 15,
            spawnZones: []
        } as Required<ServerTDMControllerConfig>

        super(fullConfig)
        this.config = fullConfig

        this.worldEventHandler.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
        })

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            inspector.addProperty(new VectorProperty("matchTime", 1)
                .withName("Продолжительность матча")
                .withGetter(() => [this.config.matchTime])
                .withSetter((time) => this.config.matchTime = time[0])
                .replaceNaN()
                .requirePositive()
            )

            inspector.addProperty(new VectorProperty("matchStartDelay", 1)
                .withName("Задержка до начала матча")
                .withGetter(() => [this.config.matchStartDelay])
                .withSetter((time) => this.config.matchStartDelay = time[0])
                .replaceNaN()
                .requirePositive()
            )

            inspector.addProperty(new VectorProperty("matchEndDelay", 1)
                .withName("Задержка до перезапуска матча")
                .withGetter(() => [this.config.matchEndDelay])
                .withSetter((time) => this.config.matchEndDelay = time[0])
                .replaceNaN()
                .requirePositive()
            )

            inspector.addProperty(new VectorProperty("singleTeamMatchTime", 1)
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