import ServerGameController from "src/server/room/game-modes/server-game-controller";
import { DMPlayerWaitingStateController } from "src/entity/types/controller-dm/server-side/dm-player-waiting-state";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import Entity from "src/utils/ecs/entity";
import { VectorProperty, PropertyInspector } from "src/entity/components/inspector/property-inspector";
import { SpawnZone } from "src/map/spawnzones-component";

export interface ServerDMControllerConfig {
    minPlayers?: number
    matchTime?: number
    singlePlayerMatchTime?: number
    matchStartDelay?: number
    matchEndDelay?: number
    spawnZones: SpawnZone[]
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
            singlePlayerMatchTime: 15,
            spawnZones: []
        }

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

            inspector.addProperty(new VectorProperty("singlePlayerMatchTime", 1)
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