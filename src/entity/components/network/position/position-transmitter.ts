import PhysicalComponent from "src/entity/components/physics-component";
import {Commands} from "../commands";
import Transmitter from "../transmitting/transmitter";
import TransformComponent from "../../transform-component";

export default class PositionTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("position-update", () => {
            this.sendPositionUpdate()
        })
    }

    onEnable() {
        super.onEnable();
        this.sendPositionUpdate()
    }

    sendPositionUpdate() {
        let transform = this.getEntity().getComponent(TransformComponent)

        this.packIfEnabled(Commands.POSITION_UPDATE_COMMAND, (buffer) => {
            let position = transform.getGlobalPosition()
            let angle = transform.getGlobalAngle()
            buffer.writeFloat32(position.x)
            buffer.writeFloat32(position.y)
            buffer.writeFloat32(angle)

            let physicsComponent = this.getEntity().getComponent(PhysicalComponent)
            let body = physicsComponent?.getBody()

            if(body) {
                buffer.writeInt8(1)
                let velocity = body.GetLinearVelocity()
                let angular = body.GetAngularVelocity()

                buffer.writeFloat32(velocity.x)
                buffer.writeFloat32(velocity.y)
                buffer.writeFloat32(angular)

                buffer.writeUint16(physicsComponent.host.worldTicks)
                buffer.writeFloat32(physicsComponent.host.physicsTick)
            } else {
                buffer.writeInt8(0)
            }
        })
    }
}