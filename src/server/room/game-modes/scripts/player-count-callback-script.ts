import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import Entity from "src/utils/ecs/entity";

export default class PlayerCountCallbackScript extends ServerGameScript {
    private callback: (playerCount: number) => void

    constructor(controller: ServerGameController, playerCountCallback: (playerCount: number) => void) {
        super(controller)
        this.callback = playerCountCallback

        this.worldEventHandler.on("player-connect", (player) => this.onPlayerConnect(player))
        this.worldEventHandler.on("player-disconnect", (player) => this.onPlayerDisconnect(player))
    }

    private getPlayerCount() {
        return this.controller.world.getComponent(ServerWorldPlayerManagerComponent)?.players.length ?? 0
    }

    private triggerCallback() {
        this.callback(this.getPlayerCount())
    }

    activate() {
        super.activate()
        this.triggerCallback()
    }

    private onPlayerConnect(player: Entity) {
        this.triggerCallback()
    }

    private onPlayerDisconnect(player: Entity) {
        this.triggerCallback()
    }
}