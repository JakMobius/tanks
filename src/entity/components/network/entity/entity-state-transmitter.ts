import {Transmitter} from "../transmitting/transmitter";
import {Commands} from "../commands";
import EntityDataTransmitComponent from "../transmitting/entity-data-transmit-component";

export default class EntityStateTransmitter extends Transmitter {
    constructor() {
        super()
    }

    attachedToRoot() {
        super.attachedToRoot()
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
        super.detachedFromRoot()
        this.pack(Commands.ENTITY_REMOVE_COMMAND, () => {})
        // As we're no longer able to navigate from this entity after
        // it's removed from the tree, the further navigation is
        // performed from its parent node.
        this.set.receivingEnd.currentNode = this.set.receivingEnd.currentNode.parent
    }
}
