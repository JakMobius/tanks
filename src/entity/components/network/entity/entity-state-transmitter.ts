import Transmitter from "../transmitting/transmitter";
import {Commands} from "../commands";
import EntityDataTransmitComponent from "../transmitting/entity-data-transmit-component";
import PrefabComponent from "src/entity/components/prefab-id-component";

export default class EntityStateTransmitter extends Transmitter {

    onEnable() {
        super.onEnable()
        const receivingEnd = this.set.receivingEnd

        const myTransmitterSet = this.set
        const myEntity = myTransmitterSet.transmitComponent.entity
        const parentEntity = myEntity.parent

        if(this.set.receivingEnd.root == myEntity) {
            // We should not synchronise events of the
            // root entity
            return;
        }

        const parentComponent = parentEntity.getComponent(EntityDataTransmitComponent)
        const parentTransmitterSet = parentComponent.transmitterSetFor(this.set.receivingEnd)

        receivingEnd.packCommand(parentTransmitterSet, Commands.ENTITY_CREATE_COMMAND, (buffer) => {
            buffer.writeUint32(this.set.entityId)
            buffer.writeString(this.set.transmitComponent.entity.getComponent(PrefabComponent).prefab.id)
        })
    }

    onDisable() {

        if(this.set.receivingEnd.root == this.set.transmitComponent.entity) {
            // We should not synchronise events of the
            // root entity
            return;
        }

        this.packIfEnabled(Commands.ENTITY_REMOVE_COMMAND, () => {})

        // Disable transmitter after sending the remove command
        super.onDisable()
    }
}
