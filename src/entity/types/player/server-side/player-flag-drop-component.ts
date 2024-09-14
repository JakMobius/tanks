import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {PlayerActionType} from "src/networking/packets/game-packets/player-action-packet";
import PlayerDropFlagEvent from "src/events/player-drop-flag-event";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import Entity from "src/utils/ecs/entity";

export default class PlayerFlagDropComponent extends EventHandlerComponent {
    constructor() {
        super();

        this.eventHandler.on("user-action", (action: PlayerActionType) => {
            if(action == PlayerActionType.flagDrop) {
                this.dropFlag()
            }
        })
    }

    dropFlag() {
        let event = new PlayerDropFlagEvent(this.entity)
        this.entity.emit("flag-drop", event)
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);
        const worldComponent = this.entity.getComponent(PlayerWorldComponent)
        worldComponent.redirectPlayerEventToWorld("flag-drop", "player-flag-drop")
    }
}