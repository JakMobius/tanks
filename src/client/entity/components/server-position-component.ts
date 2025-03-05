import * as Box2D from "@box2d/core";
import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class ServerPositionComponent extends EventHandlerComponent {
    public serverVelocity: Box2D.b2Vec2 = new Box2D.b2Vec2();
    public serverPosition: Box2D.b2Vec2 = new Box2D.b2Vec2();
    public serverAngle: number = 0
    public serverAngularVelocity: number = 0

    public serverTick: number = 0
    public serverTickTime: number = 0
    public serverSyncTime: number = 0

    public serverPositionUpdateTick: number | null = null

    private unsignedModulo(number: number, modulo: number) {
        return (number % modulo + modulo) % modulo
    }

    serverPositionReceived() {
        this.entity.emit("server-position-received")

        let serverX = this.serverPosition.x
        let serverY = this.serverPosition.y
        let serverAngle = this.serverAngle

        let transformComponent = this.entity.getComponent(TransformComponent)
        let physicalComponent = this.entity.getComponent(PhysicalComponent)

        if(physicalComponent) {
            this.serverPositionUpdateTick = physicalComponent.host.worldTicks
            const host = physicalComponent.host

            let tickDifference = this.unsignedModulo(this.serverPositionUpdateTick - this.serverTick + this.serverSyncTime, host.worldTicksModulo)

            if (tickDifference > 100) {
                this.serverSyncTime = this.unsignedModulo(this.serverSyncTime - tickDifference, host.worldTicksModulo)
                tickDifference = 0
            }

            let timeDifference = tickDifference * host.physicsTick

            serverX += this.serverVelocity.x * timeDifference
            serverY += this.serverVelocity.y * timeDifference
            serverAngle += this.serverAngularVelocity * timeDifference

            physicalComponent.setVelocity(this.serverVelocity)
            physicalComponent.setAngularVelocity(this.serverAngularVelocity)
        }

        transformComponent.setGlobalPositionAngle(
            {x: serverX, y: serverY},
            serverAngle
        )
    }
}