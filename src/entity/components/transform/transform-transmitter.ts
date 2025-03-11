import PhysicalComponent from "src/entity/components/physics-component";
import {Commands} from "../network/commands";
import Transmitter from "../network/transmitting/transmitter";
import TransformComponent from "./transform-component";

export default class TransformTransmitter extends Transmitter {
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
            let matrix = transform.getTransform()
            for(let i = 0; i < 9; i++) {
                buffer.writeFloat32(matrix.get(i))
            }

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