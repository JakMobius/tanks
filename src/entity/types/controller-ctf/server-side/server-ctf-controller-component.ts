import {CTFPlayerWaitingStateController} from "src/entity/types/controller-ctf/server-side/ctf-player-waiting-state";
import ServerTeamedGameController from "src/server/room/game-modes/server-teamed-game-controller";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import Entity from "src/utils/ecs/entity";


export default class ServerCTFControllerComponent extends ServerTeamedGameController {

    constructor() {
        super()

        this.worldEventHandler.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
        })
    }

    setWorld(world: Entity): void {
        this.activateGameState(null)
        super.setWorld(world)
        if(world) this.activateGameState(new CTFPlayerWaitingStateController(this))
    }
}