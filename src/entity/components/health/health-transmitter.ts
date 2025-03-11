
import HealthComponent from "src/entity/components/health/health-component";
import Transmitter from "../network/transmitting/transmitter";
import { Commands } from "../network/commands";

export default class HealthTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("health-set", () => this.queueHealthUpdate())
    }

    onEnable() {
        super.onEnable()
        this.queueHealthUpdate();
    }

    queueHealthUpdate() {
        this.packIfEnabled(Commands.HEALTH_UPDATE_COMMAND, (buffer) => {
            buffer.writeFloat32(this.getEntity().getComponent(HealthComponent).getHealth())
        })
    }
}
