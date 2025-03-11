import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import TimerComponent from "./timer-component";
import { Commands } from "src/entity/components/network/commands";

export default class TimerTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("timer-transmit", () => {
            this.sendUpdate()
        })
    }

    onEnable() {
        super.onEnable();
        this.sendUpdate()
    }

    sendUpdate() {
        let entity = this.getEntity()
        let timer = entity.getComponent(TimerComponent)

        this.packIfEnabled(Commands.TIMER_VALUE_COMMAND, (buffer) => {
            buffer.writeFloat32(timer.currentTime)
            buffer.writeFloat32(timer.originalTime)
        })
    }
}

ServerEntityPrefabs.types.set(EntityType.TIMER_ENTITY, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TIMER_ENTITY)(entity)

    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.visibleAnywhere = true
})