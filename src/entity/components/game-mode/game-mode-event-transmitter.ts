import ServerGameController from "src/server/room/game-modes/server-game-controller";
import Entity from "src/utils/ecs/entity";
import Transmitter from "../network/transmitting/transmitter";
import TransmitterVisibilityPrecondition from "../network/transmitting/precondition/transmitter-visibility-precondition";
import { Commands } from "../network/commands";
import GameObjectWriter from "../network/receiving/game-object-writer";

export default class GameModeEventTransmitter extends Transmitter {
    private controller: ServerGameController
    private visibilityPrecondition = new TransmitterVisibilityPrecondition(this)
    private state: any

    private stateChanged: boolean = false

    constructor(controller: ServerGameController) {
        super();
        this.controller = controller
        this.transmitterPrecondition = this.visibilityPrecondition
    }

    updateState() {
        if(this.stateChanged) return
        this.stateChanged = true
        this.getEntity().once("tick", () => {
            this.updatePrecondition()
            this.packIfEnabled(Commands.GAME_STATE_COMMAND, (buffer) => {
                this.encodeObject(this.state)
            })
            this.stateChanged = false
        })
    }

    sendEvent(event: any) {
        this.updatePrecondition()
        this.packIfEnabled(Commands.GAME_EVENT_COMMAND, (buffer) => {
            this.encodeObject(event)
        })
    }

    onEnable() {
        super.onEnable()
        this.updateState()
    }

    getState() {
        return this.controller.activeGameState?.getState(this.set.receivingEnd.player) ?? {}
    }

    updatePrecondition() {
        this.state = this.getState()
        let entityArray: Entity[] = []
        GameObjectWriter.getEntitiesFromObject(this.state, entityArray)
        this.visibilityPrecondition.setEntityArray(entityArray)
    }
}