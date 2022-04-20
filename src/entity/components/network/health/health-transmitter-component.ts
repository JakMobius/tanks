import {Transmitter} from "../transmitting/transmitter";
import HealthComponent from "../../health-component";
import {Commands} from "../commands";
import {TransmitterSet} from "../transmitting/transmitter-set";

export default class HealthTransmitterComponent extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("health-set", () => this.queueHealthUpdate())
    }

    attachToSet(set: TransmitterSet) {
        super.attachToSet(set);
        this.queueHealthUpdate();
    }

    queueHealthUpdate() {
        this.pack(Commands.HEALTH_UPDATE_COMMAND, (buffer) => {
            buffer.writeFloat32(this.getEntity().getComponent(HealthComponent).getHealth())
        })
    }
}
