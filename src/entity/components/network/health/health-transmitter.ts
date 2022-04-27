import Transmitter from "../transmitting/transmitter";
import HealthComponent from "../../health-component";
import {Commands} from "../commands";

export default class HealthTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("health-set", () => this.queueHealthUpdate())
    }

    attachedToRoot() {
        super.attachedToRoot()
        this.queueHealthUpdate();
    }

    queueHealthUpdate() {
        this.pack(Commands.HEALTH_UPDATE_COMMAND, (buffer) => {
            buffer.writeFloat32(this.getEntity().getComponent(HealthComponent).getHealth())
        })
    }
}
