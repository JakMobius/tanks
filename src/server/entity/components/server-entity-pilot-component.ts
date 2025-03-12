
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";

export default class ServerEntityPilotComponent extends EventHandlerComponent {
    pilot: Entity | null

    setPilot(player: Entity) {
        this.pilot = player
        this.entity.emit("pilot-set", player)
    }
}