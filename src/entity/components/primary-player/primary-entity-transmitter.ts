import Entity from "src/utils/ecs/entity";
import TransmitterVisibilityPrecondition
    from "src/entity/components/network/transmitting/precondition/transmitter-visibility-precondition";
import Transmitter from "../network/transmitting/transmitter";
import { Commands } from "../network/commands";

export default class PrimaryEntityTransmitter extends Transmitter {

    entity: Entity | null
    private visibilityPrecondition = new TransmitterVisibilityPrecondition(this)

    constructor() {
        super();
        this.transmitterPrecondition = this.visibilityPrecondition
    }

    updatePrecondition() {
        this.visibilityPrecondition.setEntityArray(this.entity ? [this.entity] : [])
    }

    setEntity(entity: Entity) {
        this.entity = entity
        this.updatePrecondition()
        this.updateEntity()
    }

    onEnable() {
        super.onEnable()
        this.updateEntity()
    }

    updateEntity() {
        this.packIfEnabled(Commands.PLAYER_TANK_SET, (buffer) => {
            buffer.writeInt8(this.entity != null ? 1 : 0)
            if(this.entity) {
                this.pointToEntity(this.entity)
            }
        })
    }
}
