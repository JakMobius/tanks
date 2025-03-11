import { Commands } from "src/entity/components/network/commands";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import SpawnzoneComponent from "./spawnzone-component";

export default class SpawnzoneTransmitter extends Transmitter {
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
        let spawnzone = this.getEntity().getComponent(SpawnzoneComponent)

        this.packIfEnabled(Commands.SPAWNZONE_DATA_COMMAND, (buffer) => {
            buffer.writeInt32(spawnzone.team)
            buffer.writeFloat32(spawnzone.spawnAngle)
        })
    }
}