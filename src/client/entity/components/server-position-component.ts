import * as Box2D from "@box2d/core";
import PhysicalComponent from "src/entity/components/physics-component";
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
        let physicalComponent = this.entity.getComponent(PhysicalComponent)
        this.entity.emit("server-position-received")
        this.serverPositionUpdateTick = physicalComponent.host.worldTicks

        const component = this.entity.getComponent(PhysicalComponent)
        const host = component.host

        let serverX = this.serverPosition.x
        let serverY = this.serverPosition.y

        let tickDifference = this.unsignedModulo(this.serverPositionUpdateTick - this.serverTick + this.serverSyncTime, host.worldTicksModulo)

        if (tickDifference > 100) {
            this.serverSyncTime = this.unsignedModulo(this.serverSyncTime - tickDifference, host.worldTicksModulo)
            tickDifference = 0
        }

        let timeDifference = tickDifference * host.physicsTick

        serverX += this.serverVelocity.x * timeDifference
        serverY += this.serverVelocity.y * timeDifference

        component.setPositionAngle(
            {x: serverX, y: serverY},
            this.serverAngle + this.serverAngularVelocity * timeDifference
        )
        component.setVelocity(this.serverVelocity)
        component.setAngularVelocity(this.serverAngularVelocity)
    }
}