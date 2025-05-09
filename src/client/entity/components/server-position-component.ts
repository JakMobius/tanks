import * as Box2D from "@box2d/core";
import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { Matrix3 } from "src/utils/matrix3";

export default class ServerPositionComponent extends EventHandlerComponent {
    public serverVelocity: Box2D.b2Vec2 = new Box2D.b2Vec2();
    public serverTransform: Matrix3
    public serverAngularVelocity: number = 0

    public serverTick: number = 0
    public serverTickTime: number = 0
    public serverSyncTime: number = 0

    public serverPositionUpdateTick: number | null = null

    private needsPositionUpdate = false

    private unsignedModulo(number: number, modulo: number) {
        return (number % modulo + modulo) % modulo
    }

    constructor() {
        super()
        this.eventHandler.on("before-physics", () => this.onBeforePhysics())
    }

    onBeforePhysics() {
        if(!this.needsPositionUpdate) return
        this.needsPositionUpdate = false

        let physicalComponent = this.entity.getComponent(PhysicalComponent)
        let transformComponent = this.entity.getComponent(TransformComponent)

        let transform = this.serverTransform.clone()
        transformComponent.setTransform(transform)

        this.serverPositionUpdateTick = physicalComponent.host.worldTicks
        const host = physicalComponent.host

        let tickDifference = this.unsignedModulo(this.serverPositionUpdateTick - this.serverTick + this.serverSyncTime, host.worldTicksModulo)

        if (tickDifference > 100) {
            this.serverSyncTime = this.unsignedModulo(this.serverSyncTime - tickDifference, host.worldTicksModulo)
            tickDifference = 0
        }

        let timeDifference = tickDifference * host.physicsTick

        let position = transformComponent.getGlobalPosition()
        let angle = transformComponent.getGlobalAngle()

        position.x += this.serverVelocity.x * timeDifference
        position.y += this.serverVelocity.y * timeDifference
        angle += this.serverAngularVelocity * timeDifference

        transformComponent.setGlobal({ position, angle })

        physicalComponent.setVelocity(this.serverVelocity)
        physicalComponent.setAngularVelocity(this.serverAngularVelocity)
    }

    serverPositionReceived() {
        this.entity.emit("server-position-received")
        let physicalComponent = this.entity.getComponent(PhysicalComponent)

        if(physicalComponent) {
            this.needsPositionUpdate = true
        } else {
            let transformComponent = this.entity.getComponent(TransformComponent)
            let transform = this.serverTransform.clone()

            transformComponent.setTransform(transform)
        }
    }
}