import Transmitter from "../transmitting/transmitter";
import {Commands} from "../commands";
import CollisionDisableComponent from "src/entity/components/collision-disable";

export default class CollisionDisableTransmitter extends Transmitter {
    constructor() {
        super()
        this.eventHandler.on("collision-disable-toggled", () => {
            this.update()
        })
    }

    onEnable() {
        super.onEnable()

        this.update()
    }

    update() {
        this.packIfEnabled(Commands.COLLISION_DISABLE_COMMAND, (buffer) => {
            buffer.writeInt8(this.getEntity().getComponent(CollisionDisableComponent).collisionsDisabled ? 1 : 0)
        })
    }
}
