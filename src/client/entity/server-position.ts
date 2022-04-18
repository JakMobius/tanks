import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import {Vec2} from "../../library/box2d";
import PhysicalComponent from "../../entity/physics-component";
import ReadBuffer from "../../serialization/binary/read-buffer";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";

export default class ServerPosition implements Component {
    public entity: Entity | null;
    public serverVelocity: Vec2 = new Vec2();
    public serverPosition: Vec2 = new Vec2();
    public serverPositionUpdateDate: number = 0
    public eventHandler = new BasicEventHandlerSet()

    constructor() {
        this.eventHandler.on("tick", (dt: number) => this.onTick(dt))
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(this.entity)
    }

    decodePosition(decoder: ReadBuffer) {
        const x = decoder.readFloat32()
        const y = decoder.readFloat32()
        const rotation = decoder.readFloat32()
        const vx = decoder.readFloat32()
        const vy = decoder.readFloat32()
        const angularVelocity = decoder.readFloat32()

        const body = this.entity.getComponent(PhysicalComponent).getBody()

        body.SetPositionXY(x, y)

        let velocity = body.GetLinearVelocity()

        velocity.Set(vx, vy)

        body.SetLinearVelocity(velocity)
        body.SetAngularVelocity(angularVelocity)
        body.SetAngle(rotation)
    }

    decodeMovement(decoder: ReadBuffer) {
        let teleport = decoder.readUint8()
        let x = decoder.readFloat32()
        let y = decoder.readFloat32()
        let rotation = decoder.readFloat32()
        let vx = decoder.readFloat32()
        let vy = decoder.readFloat32()
        let angularVelocity = decoder.readFloat32()

        const body = this.entity.getComponent(PhysicalComponent).getBody()

        let velocity = body.GetLinearVelocity()

        velocity.Set(vx, vy)

        body.SetLinearVelocity(velocity)
        body.SetAngularVelocity(angularVelocity)

        // When teleporting, entity should instantly move
        // from one point to another. Otherwise, this
        // meant to be continuous movement. Considering
        // ping jitter and other imperfections of WWW,
        // these positions should be interpolated to give
        // a smooth move impression to player.

        if (teleport) {
            body.SetPositionXY(x, y)
        }

        this.serverPosition.Set(x, y)
        this.serverVelocity.Set(vx, vy)
        this.serverPositionUpdateDate = Date.now()

        body.SetAngle(rotation)
    }

    private onTick(dt: number) {
        if(this.serverPositionUpdateDate) {
            const body = this.entity.getComponent(PhysicalComponent).getBody()
            let pos = body.GetPosition()

            let targetX = this.serverPosition.x
            let targetY = this.serverPosition.y

            let timePassedSinceUpdate = (Date.now() - this.serverPositionUpdateDate) / 1000

            if(timePassedSinceUpdate < 0.1) {
                targetX += this.serverVelocity.x * timePassedSinceUpdate
                targetY += this.serverVelocity.y * timePassedSinceUpdate
            }

            let diffX = (targetX - pos.x)
            let diffY = (targetY - pos.y)

            if(diffX * diffX + diffY * diffY > 400) {
                body.SetPositionXY(targetX, targetY)
            } else {
                body.SetPositionXY(pos.x + diffX / 20, pos.y + diffY / 20)
            }
        }
    }
}