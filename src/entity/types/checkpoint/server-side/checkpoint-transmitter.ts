import { Commands } from "src/entity/components/network/commands";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import ServerCheckpointComponent from "./server-checkpoint-component";

export default class CheckpointTransmitter extends Transmitter {
    constructor() {
        super()
        
    }

    onEnable() {

    }

    sendUpdate() {
        let checkpoint = this.getEntity().getComponent(ServerCheckpointComponent)

        this.packIfEnabled(Commands.CHECKPOINT_DATA_COMMAND, (buffer) => {
            
        })
    }
}