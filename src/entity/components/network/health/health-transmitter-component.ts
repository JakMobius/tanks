import {TransmitterComponent} from "../transmitter-component";
import HealthComponent from "../../health-component";
import {Commands} from "../commands";

export default class HealthTransmitterComponent extends TransmitterComponent {
    private waitsHealthSync = false

    constructor() {
        super()

        this.eventHandler.on("health-set", () => {
            if(this.waitsHealthSync) return
            this.waitsHealthSync = true

            this.onPack((context) => {
                this.waitsHealthSync = false
                context.pack(Commands.HEALTH_UPDATE_COMMAND, (buffer) => {
                    buffer.writeFloat32(this.entity.getComponent(HealthComponent).getHealth())
                })
            })
        })
    }
}
