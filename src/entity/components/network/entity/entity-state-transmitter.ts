import {Transmitter} from "../transmitting/transmitter";
import {Commands} from "../commands";
import EntityDataTransmitComponent from "../transmitting/entity-data-transmit-component";

export default class EntityStateTransmitter extends Transmitter {
    constructor() {
        super()
    }

    attachedToRoot() {
        const receivingEnd = this.set.receivingEnd

        const myTransmitterSet = this.set
        const myEntity = myTransmitterSet.transmitComponent.entity
        const parentEntity = myEntity.parent
        const parentComponent = parentEntity.getComponent(EntityDataTransmitComponent)
        const parentTransmitterSet = parentComponent.getTransmitterSet(this.set.receivingEnd)

        receivingEnd.packCommand(parentTransmitterSet, Commands.ENTITY_CREATE_COMMAND, (buffer) => {
            buffer.writeUint32(this.set.transmitComponent.networkIdentifier)
            buffer.writeUint32(this.set.transmitComponent.configScriptIndex)
        })
    }

    detachedFromRoot() {
        this.pack(Commands.ENTITY_REMOVE_COMMAND, () => {})
    }
}
