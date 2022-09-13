import Transmitter from "../transmitting/transmitter";
import {Commands} from "../commands";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import TransmitterVisibilityPrecondition from "../transmitting/precondition/transmitter-visibility-precondition";
import GameObjectWriter from "../receiving/game-object-writer";
import Entity from "src/utils/ecs/entity";

export default class GameModeEventTransmitter extends Transmitter {
    private controller: ServerGameController
    private visibilityPrecondition = new TransmitterVisibilityPrecondition(this)
    private state: any

    constructor(controller: ServerGameController) {
        super();
        this.controller = controller

        this.eventHandler.on("state-broadcast", () => {
            this.state = this.getState()
            this.updatePrecondition()
            this.sendState()
        })

        this.transmitterPrecondition = this.visibilityPrecondition
    }

    onEnable() {
        super.onEnable()
        this.sendState()
    }

    getState() {
        return this.controller.activeController.getState()
    }

    updatePrecondition() {
        let entityArray: Entity[] = []
        GameObjectWriter.getEntitiesFromObject(this.state, entityArray)
        this.visibilityPrecondition.setEntityArray(entityArray)
    }

    sendState() {
        this.packIfEnabled(Commands.GAME_STATE_COMMAND, (buffer) => {
            this.encodeObject(this.state)
        })
    }
}