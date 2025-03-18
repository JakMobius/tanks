import * as Box2D from "@box2d/core"
import {Wheel, WheelGroup} from "src/entity/components/transmission/units/wheel-group";
import PhysicalComponent from "src/entity/components/physics-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class TankWheelsComponent extends EventHandlerComponent {
    private wheels: WheelGroup[] = []

    constructor(wheels: WheelGroup[] = []) {
        super()
        this.eventHandler.on("physics-tick", (dt) => this.onTick(dt))
        this.setWheels(wheels)
    }

    getWheelGroups() {
        return this.wheels
    }

    setWheels(wheels: WheelGroup[]) {
        this.wheels = wheels
    }

    private getWheelTorqueFromTension(wheel: Wheel, tension: number) {
        return tension * wheel.grip / wheel.tensionLimit * wheel.group.radius
    }

    private handleWheelReactions(wheelGroup: WheelGroup, dt: number) {
        let body = this.entity.getComponent(PhysicalComponent).getBody()
        let torque = 0
        let wheelRotationSpeed = wheelGroup.transmission.system.qdot[wheelGroup.unitIndex]

        for (let wheel of wheelGroup.wheels) {
            let x = wheel.x;
            let y = wheel.y;
            let angle = wheel.angle;

            let wheelTranslation = {x: x, y: y}
            let wheelVelocity = {x: 0, y: 0}

            // set wheelVelocity to world-space velocity of the wheel
            body.GetLinearVelocityFromLocalPoint(wheelTranslation, wheelVelocity)

            // set wheelTranslation to vehicle-space velocity of the wheel
            body.GetLocalVector(wheelVelocity, wheelTranslation)

            // set wheelTranslation to wheel-space velocity of the wheel
            Box2D.b2Vec2.prototype.Rotate.call(wheelTranslation, angle)

            wheel.groundSpeed = wheelTranslation.x

            // set wheelTranslation to wheel-space translation of the wheel on this tick
            Box2D.b2Vec2.prototype.Scale.call(wheelTranslation, dt)

            let tickMovement = wheelRotationSpeed * dt * wheelGroup.circumference

            wheel.tensionVector.Add(wheelTranslation)
            wheel.tensionVector.x -= tickMovement

            let tickDistance = Math.abs(tickMovement)

            // Simulating lateral tension loss

            if (wheel.tensionVector.x > 0) {
                wheel.tensionVector.x -= tickDistance * wheel.lateralTensionLossPerMeter
                if (wheel.tensionVector.x < 0) wheel.tensionVector.x = 0
            } else if (wheel.tensionVector.x < 0) {
                wheel.tensionVector.x += tickDistance * wheel.lateralTensionLossPerMeter
                if (wheel.tensionVector.x > 0) wheel.tensionVector.x = 0
            }

            // If wheel has too much tension, it will start
            // to slide. Simulate it by limiting the tension vector

            let wheelTensionLength = wheel.tensionVector.Length()

            let slippedDistance = wheelTensionLength - wheel.tensionLimit

            if (slippedDistance > 0) {
                wheel.slideVelocity = slippedDistance / dt
                wheel.tensionVector.Scale(wheel.tensionLimit / wheelTensionLength)
            } else {
                wheel.slideVelocity = 0
            }

            torque += this.getWheelTorqueFromTension(wheel, wheel.tensionVector.x)

            // if(wheelRotationSpeed > 0) {
            //     wheelRotationSpeed -= wheel.brakeTorque / wheelRotationSpeed * dt
            //     if(wheelRotationSpeed < 0) wheelRotationSpeed = 0
            // } else {
            //     wheelRotationSpeed += wheel.brakeTorque / wheelRotationSpeed * dt
            //     if(wheelRotationSpeed > 0) wheelRotationSpeed = 0
            // }

            let wheelTension = {x: wheel.tensionVector.x, y: wheel.tensionVector.y}

            // Decreasing wheel reaction if the vehicle is moving back to its neutral position
            let projection = wheelTranslation.y / wheel.tensionVector.y
            if (projection < 0) {
                wheelTension.y /= (1 - projection * 10);
            }

            Box2D.b2Vec2.prototype.Scale.call(wheelTension, wheel.grip / wheel.tensionLimit);
            Box2D.b2Vec2.prototype.Rotate.call(wheelTension, -angle)

            let wheelPosition = {x: 0, y: 0}
            body.GetWorldVector({x: wheel.x, y: wheel.y}, wheelPosition)

            let wheelReaction = {x: 0, y: 0}
            body.GetWorldVector(wheelTension, wheelReaction)
            Box2D.b2Vec2.prototype.Add.call(wheelPosition, body.GetPosition())
            Box2D.b2Vec2.prototype.Negate.call(wheelReaction)

            body.ApplyForce(wheelReaction, wheelPosition)
        }
        
        wheelGroup.transmission.system.Q[wheelGroup.unitIndex] += torque
    }

    onTick(dt: number) {
        for (let wheel of this.wheels) {
            this.handleWheelReactions(wheel, dt)
        }
    }
}