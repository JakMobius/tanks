import Transmitter from "../transmitting/transmitter";
import HealthComponent from "../../health-component";
import {Commands} from "../commands";

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
