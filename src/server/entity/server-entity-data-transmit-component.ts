import {TransmitterSet} from "../../entity/components/network/transmitting/transmitter-set";
import EntityStateTransmitter from "../../entity/components/network/entity/entity-state-transmitter";
import EntityDataTransmitComponent from "../../entity/components/network/transmitting/entity-data-transmit-component";

export default class ServerEntityDataTransmitComponent extends EntityDataTransmitComponent {
    constructor() {
        super()

        this.eventHandler.on("transmitter-set-attached", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(EntityStateTransmitter)
        })
    }
}