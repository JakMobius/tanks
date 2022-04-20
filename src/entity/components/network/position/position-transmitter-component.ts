import PhysicalComponent from "../../physics-component";
import {Commands} from "../commands";
import {Transmitter} from "../transmitter";

export default class PositionTransmitterComponent extends Transmitter {
    private waitsPositionSync = false

    constructor() {
        super()

        this.eventHandler.on("tick", () => {
            if(this.waitsPositionSync) return
            this.waitsPositionSync = true

            this.performOnPack((context) => {
                this.waitsPositionSync = false
                context.pack(Commands.POSITION_UPDATE_COMMAND, (buffer) => {
                    let body = this.getEntity().getComponent(PhysicalComponent).getBody()
                    let position = body.GetPosition()
                    buffer.writeFloat32(position.x)
                    buffer.writeFloat32(position.y)
                    buffer.writeFloat32(body.GetAngle())

                    let velocity = body.GetLinearVelocity()
                    let angular = body.GetAngularVelocity()

                    buffer.writeFloat32(velocity.x)
                    buffer.writeFloat32(velocity.y)
                    buffer.writeFloat32(angular)
                })
            })
        })
    }
}