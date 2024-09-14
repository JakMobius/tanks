import PhysicalComponent from "src/entity/components/physics-component";
import {Commands} from "../commands";
import Transmitter from "../transmitting/transmitter";

export default class PositionTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("teleport", () => {
            this.sendPositionUpdate()
        })

        this.eventHandler.on("tick", () => {
            this.sendPositionUpdate()
        })
    }

    onEnable() {
        super.onEnable();
        this.sendPositionUpdate()
        // console.log("enable")
    }

    sendPositionUpdate() {
        let component = this.getEntity().getComponent(PhysicalComponent)
        let body = component.getBody()
        if(!body) return;

        this.packIfEnabled(Commands.POSITION_UPDATE_COMMAND, (buffer) => {
            let position = body.GetPosition()
            buffer.writeFloat32(position.x)
            buffer.writeFloat32(position.y)
            buffer.writeFloat32(body.GetAngle())

            let velocity = body.GetLinearVelocity()
            let angular = body.GetAngularVelocity()

            buffer.writeFloat32(velocity.x)
            buffer.writeFloat32(velocity.y)
            buffer.writeFloat32(angular)

            buffer.writeUint16(component.host.worldTicks)
            buffer.writeFloat32(component.host.physicsTick)
        })
    }
}