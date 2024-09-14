import {Vec2, XY} from 'src/library/box2d'
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
            Vec2.prototype.SelfRotate.call(wheelTranslation, -angle)

            wheel.groundSpeed = wheelTranslation.y

            // set wheelTranslation to wheel-space translation of the wheel on this tick
            Vec2.prototype.SelfMul.call(wheelTranslation, dt)

            let tickMovement = wheelRotationSpeed * dt * wheelGroup.circumference

            wheel.tensionVector.SelfAdd(wheelTranslation)
            wheel.tensionVector.y -= tickMovement

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
                wheel.tensionVector.SelfMul(wheel.tensionLimit / wheelTensionLength)
            } else {
                wheel.slideVelocity = 0
            }

            torque += this.getWheelTorqueFromTension(wheel, wheel.tensionVector.y)

            // if(wheelRotationSpeed > 0) {
            //     wheelRotationSpeed -= wheel.brakeTorque / wheelRotationSpeed * dt
            //     if(wheelRotationSpeed < 0) wheelRotationSpeed = 0
            // } else {
            //     wheelRotationSpeed += wheel.brakeTorque / wheelRotationSpeed * dt
            //     if(wheelRotationSpeed > 0) wheelRotationSpeed = 0
            // }

            let wheelTension = {x: wheel.tensionVector.x, y: wheel.tensionVector.y}

            // Decreasing wheel reaction if the vehicle is moving back to its neutral position
            let projection = wheelTranslation.x / wheel.tensionVector.x
            if (projection < 0) {
                wheelTension.x /= (1 - projection * 10);
            }

            Vec2.prototype.SelfMul.call(wheelTension, wheel.grip / wheel.tensionLimit);
            Vec2.prototype.SelfRotate.call(wheelTension, angle)

            let wheelPosition = {x: 0, y: 0}
            body.GetWorldVector({x: wheel.x, y: wheel.y}, wheelPosition)

            let wheelReaction = {x: 0, y: 0}
            body.GetWorldVector(wheelTension, wheelReaction)
            Vec2.prototype.SelfAdd.call(wheelPosition, body.GetPosition())
            Vec2.prototype.SelfNeg.call(wheelReaction)

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