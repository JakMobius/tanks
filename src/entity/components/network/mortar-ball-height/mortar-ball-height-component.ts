import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import MortarBallHeightTransmitter
    from "src/entity/components/network/mortar-ball-height/mortar-ball-height-transmitter";

export default class MortarBallHeightComponent extends EventHandlerComponent {
    height: number = 0
    vSpeed: number = 0
    gravity: number = 9.8

    constructor() {
        super();

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(MortarBallHeightTransmitter)
        })

        this.eventHandler.on("physics-tick", (dt) => {
            this.height += this.vSpeed * dt
            this.vSpeed -= this.gravity * dt
        })
    }
}