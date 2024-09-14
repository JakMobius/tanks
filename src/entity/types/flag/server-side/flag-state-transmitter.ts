import Transmitter from "src/entity/components/network/transmitting/transmitter";
import PhysicalComponent from "src/entity/components/physics-component";
import {Commands} from "src/entity/components/network/commands";
import TransmitterVisibilityPrecondition
    from "src/entity/components/network/transmitting/precondition/transmitter-visibility-precondition";
import FlagStateComponent from "src/entity/types/flag/flag-state-component";

export default class FlagStateTransmitter extends Transmitter {

    private visibilityPrecondition = new TransmitterVisibilityPrecondition(this)

    constructor() {
        super()

        this.eventHandler.on("flag-state-changed", () => {
            this.updatePrecondition()
            this.sendUpdate()
        })

        this.transmitterPrecondition = this.visibilityPrecondition
    }

    updatePrecondition() {
        let flagState = this.getEntity().getComponent(FlagStateComponent)

        if(flagState.carrier) {
            this.visibilityPrecondition.setEntityArray([flagState.carrier])
        } else {
            this.visibilityPrecondition.setEntityArray([])
        }
    }

    onEnable() {
        super.onEnable();
        this.sendUpdate()
    }

    sendUpdate() {
        let flagState = this.getEntity().getComponent(FlagStateComponent)

        this.packIfEnabled(Commands.FLAG_POSITION_COMMAND, (buffer) => {
            buffer.writeInt8(flagState.teamId === null ? -1 : flagState.teamId)
            if (flagState.carrier) {
                buffer.writeUint8(1)
                this.pointToEntity(flagState.carrier)
            } else {
                buffer.writeUint8(0)
                let body = this.getEntity().getComponent(PhysicalComponent).getBody()

                let position = body.GetPosition()
                buffer.writeFloat32(position.x)
                buffer.writeFloat32(position.y)
            }
        })
    }
}