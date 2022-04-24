import {Transmitter} from "../transmitting/transmitter";
import {Commands} from "../commands";
import Entity from "../../../../utils/ecs/entity";

export default class PrimaryPlayerTransmitter extends Transmitter {

    entity: Entity | null

    setEntity(entity: Entity) {
        this.entity = entity
        this.updateEntity()
    }

    attachedToRoot() {
        super.attachedToRoot()
        this.updateEntity()
    }

    updateEntity() {
        this.pack(Commands.PLAYER_TANK_SET, (buffer) => {
            buffer.writeInt8(this.entity != null ? 1 : 0)
            if(this.entity) {
                this.pointToEntity(this.entity)
            }
        })
    }
}
