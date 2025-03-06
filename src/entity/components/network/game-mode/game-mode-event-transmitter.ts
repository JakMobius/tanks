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
            this.updatePrecondition()
            this.sendState()
        })

        this.eventHandler.on("event-broadcast", (event) => {
            this.updatePrecondition()
            this.sendEvent(event)
        })

        this.transmitterPrecondition = this.visibilityPrecondition
    }

    onEnable() {
        super.onEnable()
        this.sendState()
    }

    getState() {
        return this.controller.activeGameState?.getState() ?? {}
    }

    updatePrecondition() {
        this.state = this.getState()
        let entityArray: Entity[] = []
        GameObjectWriter.getEntitiesFromObject(this.state, entityArray)
        this.visibilityPrecondition.setEntityArray(entityArray)
    }

    sendState() {
        this.packIfEnabled(Commands.GAME_STATE_COMMAND, (buffer) => {
            this.encodeObject(this.state)
        })
    }

    sendEvent(event: any) {
        this.packIfEnabled(Commands.GAME_EVENT_COMMAND, (buffer) => {
            this.encodeObject(event)
        })
    }
}