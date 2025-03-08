import ServerGameController from "src/server/room/game-modes/server-game-controller";
import { DMPlayerWaitingStateController } from "src/entity/types/controller-dm/server-side/dm-player-waiting-state";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import Entity from "src/utils/ecs/entity";
import { VectorProperty, PropertyInspector } from "src/entity/components/inspector/property-inspector";

export default class ServerDMControllerComponent extends ServerGameController {

    singlePlayerMatchTime = 15

    constructor() {
        super()

        this.worldEventHandler.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
        })

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            inspector.addProperty(new VectorProperty("singlePlayerMatchTime", 1)
                .withName("Задержка победы без соперников")
                .withGetter(() => [this.singlePlayerMatchTime])
                .withSetter((time) => this.singlePlayerMatchTime = time[0])
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