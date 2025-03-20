
import PlayerRespawnActionComponent from "src/entity/types/player/server-side/player-respawn-action-component";
import { RandomRespawnScript } from "src/server/room/game-modes/scripts/respawn-script";
import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";
import ServerFreeroamControllerComponent from "./freeroam-controller";

export class FreeroamPlayingStateController extends ServerGameStateController<ServerFreeroamControllerComponent, {}> {

    constructor(controller: ServerFreeroamControllerComponent) {
        super(controller)
        this.addScript(new RandomRespawnScript(this.controller))
    }

    activate() {
        super.activate()
        // TODO: reload map
        this.controller.triggerStateBroadcast()
        this.respawnPlayers()
    }

    private respawnPlayers() {
        let players = this.controller.players
        for(let player of players) {
            player.getComponent(PlayerRespawnActionComponent).performRespawnAction()
        }
    }

    getState() { return {} }
}