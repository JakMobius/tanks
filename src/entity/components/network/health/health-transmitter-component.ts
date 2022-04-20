import {Transmitter} from "../transmitter";
import HealthComponent from "../../health-component";
import {Commands} from "../commands";
import {TransmitterSet} from "../entity-data-transmit-component";

export default class HealthTransmitterComponent extends Transmitter {
    private waitsHealthSync = false

    constructor() {
        super()

        this.eventHandler.on("health-set", () => this.queueHealthUpdate())
    }

    attachToSet(set: TransmitterSet) {
        super.attachToSet(set);
        this.queueHealthUpdate();
    }

    queueHealthUpdate() {
        if(this.waitsHealthSync) return
        this.waitsHealthSync = true

        this.performOnPack((context) => {
            this.waitsHealthSync = false
            context.pack(Commands.HEALTH_UPDATE_COMMAND, (buffer) => {
                buffer.writeFloat32(this.getEntity().getComponent(HealthComponent).getHealth())
            })
        })
    }
}
