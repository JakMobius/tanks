import { Commands } from "src/entity/components/network/commands";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import CheckpointComponent from "./checkpoint-component";

export default class CheckpointTransmitter extends Transmitter {
    constructor() {
        super()
        
        this.eventHandler.on("team-set", () => this.sendUpdate())
        this.eventHandler.on("spawn-angle-set", () => this.sendUpdate())
    }

    onEnable() {
        super.onEnable();
        this.sendUpdate()
    }

    sendUpdate() {
        let checkpoint = this.getEntity().getComponent(CheckpointComponent)

        this.packIfEnabled(Commands.CHECKPOINT_DATA_COMMAND, (buffer) => {
            
        })
    }
}