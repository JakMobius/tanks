import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import {
    UserChooseTankMessageTransmitter,
    UserSelfDestructMessageTransmitter,
    UserTankChangeOnRespawnMessageTransmitter
} from "src/entity/components/network/event/user-message-transmitters";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class UserMessageTransmitComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(UserTankChangeOnRespawnMessageTransmitter)
            transmitterSet.initializeTransmitter(UserChooseTankMessageTransmitter)
            transmitterSet.initializeTransmitter(UserSelfDestructMessageTransmitter)
        })
    }
}