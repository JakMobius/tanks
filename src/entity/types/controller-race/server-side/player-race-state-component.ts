import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import ServerCheckpointComponent from "../../checkpoint/server-side/server-checkpoint-component";

export class PlayerRaceStateComponent extends EventHandlerComponent {

    lastCheckpointIndex: number | null = null
    startTicks: number = 0

    passCheckpoint(entity: Entity) {
        let checkpoint = entity.getComponent(ServerCheckpointComponent)
        this.lastCheckpointIndex = checkpoint.index

        this.entity.emit("checkpoint-pass", entity)
    }
}