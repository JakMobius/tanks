import { Commands } from "src/entity/components/network/commands";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import SpawnzoneComponent from "./spawnzone-component";

export default class SpawnzoneTransmitter extends Transmitter {
    constructor() {
        super()
        
        this.eventHandler.on("team-set", () => {
            this.sendPositionUpdate()
        })
    }

    onEnable() {
        super.onEnable();
        this.sendPositionUpdate()
    }

    sendPositionUpdate() {
        let spawnzone = this.getEntity().getComponent(SpawnzoneComponent)

        this.packIfEnabled(Commands.SPAWNZONE_TEAM_SET_COMMAND, (buffer) => {
            buffer.writeInt32(spawnzone.team)
        })
    }
}