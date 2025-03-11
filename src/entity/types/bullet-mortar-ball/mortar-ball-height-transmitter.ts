import Transmitter from "src/entity/components/network/transmitting/transmitter";
import {Commands} from "src/entity/components/network/commands";
import MortarBallHeightComponent from "./mortar-ball-height-component";

export default class MortarBallHeightTransmitter extends Transmitter {

    constructor() {
        super();
        this.eventHandler.on("tick", () => {
            this.sendPosition();
        })
    }

    onEnable() {
        super.onEnable();
        this.sendPosition()
    }

    private sendPosition() {
        const heightComponent = this.getEntity().getComponent(MortarBallHeightComponent)
        if(!heightComponent) return

        this.packIfEnabled(Commands.MORTAR_BALL_HEIGHT_SET, (buffer) => {
            buffer.writeFloat32(heightComponent.height)
            buffer.writeFloat32(heightComponent.vSpeed)
        })
    }
}