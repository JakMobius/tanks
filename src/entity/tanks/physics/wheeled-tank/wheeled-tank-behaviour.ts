import {Vec2} from '../../../../library/box2d'
import TankBehaviour from '../tank-behaviour';
import TankModel from "../../tank-model";
import {TankWheel} from "./wheel";
import PhysicalComponent from "../../../components/physics-component";

export interface WheeledTankBehaviourConfig {

    wheels: TankWheel[]

    /**
     * Maximum force with which the engine will push the tank (in newtons)
     */
    engineMaxTorque: number;

    /**
     * Engine enginePower of the tank (in watts)
     */
    enginePower?: number

    /**
     * Minimal turning radius of the vehicle
     */
    minSteerRadius?: number

    /**
     * If the vehicle turns without the wheels sliding,
     * the perpendicular to the vehicle's longitudinal
     * axis, drawn through the center of rotation, will
     * pass through the point set by this value.
     */
    steerAnchorOffset?: number
}

export default class WheeledTankBehaviour extends TankBehaviour {
    public wheels: TankWheel[] = []
    public minSteerRadius: number;
    public steerAnchorOffset: number;
    public driveWheelCount: number
    public maxEngineTorque: number;
    public enginePower: number

    constructor(tank: TankModel, config: WheeledTankBehaviourConfig) {
        super(tank)

        this.enginePower = config.enginePower
        this.maxEngineTorque = config.engineMaxTorque
        this.minSteerRadius = config.minSteerRadius || 5
        this.steerAnchorOffset = config.steerAnchorOffset || 0
        this.wheels = config.wheels
        this.driveWheelCount = this.calculateDriveWheelCount()
    }

    /**
     * @returns number average speed of all driving wheels
     */
    getDrivetrainSpeed(): number {
        let totalSpeed = 0
        for(let wheel of this.wheels) {
            if(wheel.isDriving) totalSpeed += wheel.speed
        }
        return Math.abs(totalSpeed / this.driveWheelCount)
    }

    private calculateDriveWheelCount() {
        let result = 0;
        for(let wheel of this.wheels) {
            if(wheel.isDriving) result++
        }
        return result;
    }

    private getWheelForceFromTension(wheel: TankWheel, tension: number) {
        return tension * wheel.grip / wheel.tensionLimit
    }

    private getWheelReaction(wheel: TankWheel, out: Vec2, dt: number) {
        let x = wheel.position.x;
        let y = wheel.position.y;
        let angle = wheel.angle;

        let body = this.entity.getComponent(PhysicalComponent).getBody()
        this.localVector2.x = x
        this.localVector2.y = y

        // set localVector1 to world-space velocity of the wheel
        body.GetLinearVelocityFromLocalPoint(this.localVector2, this.localVector1)

        // set localVector2 to vehicle-space velocity of the wheel
        body.GetLocalVector(this.localVector1, this.localVector2)

        // set localVector2 to wheel-space velocity of the wheel
        this.localVector2.SelfRotate(-angle)

        wheel.groundSpeed = this.localVector2.y

        // set localVector2 to wheel-space translation of the wheel on this tick
        this.localVector2.SelfMul(dt)

        let tickMovement = wheel.speed * dt

        wheel.tensionVector.SelfAdd(this.localVector2)
        wheel.tensionVector.y -= tickMovement
        wheel.distance += tickMovement

        let tickDistance = Math.abs(tickMovement)

        // Simulating lateral tension loss

        if(wheel.tensionVector.x > 0) {
            wheel.tensionVector.x -= tickDistance * wheel.lateralTensionLossPerMeter
            if(wheel.tensionVector.x < 0) wheel.tensionVector.x = 0
        } else if(wheel.tensionVector.x < 0) {
            wheel.tensionVector.x += tickDistance * wheel.lateralTensionLossPerMeter
            if(wheel.tensionVector.x > 0) wheel.tensionVector.x = 0
        }

        // If wheel has too much tension, it will start
        // to slide. Simulating it by limiting tension vector

        let wheelTension = wheel.tensionVector.Length()

        wheel.isSliding = wheelTension > wheel.tensionLimit

        if(wheel.isSliding) {
            wheel.tensionVector.SelfMul(wheel.tensionLimit / wheelTension)
        }

        const totalWheelTorque = wheel.torque + this.getWheelForceFromTension(wheel, wheel.tensionVector.y)
        wheel.speed += totalWheelTorque / wheel.mass * dt

        if(wheel.speed > 0) {
            wheel.speed -= wheel.brakeTorque / wheel.mass * dt
            if(wheel.speed < 0) wheel.speed = 0
        } else {
            wheel.speed += wheel.brakeTorque / wheel.mass * dt
            if(wheel.speed > 0) wheel.speed = 0
        }

        this.localVector3.Copy(wheel.tensionVector)

        // Decreasing wheel reaction if the vehicle is moving back to its neutral position
        let projection = this.localVector2.x / wheel.tensionVector.x
        if(projection < 0) {
            this.localVector3.x /= (1 - projection * 10);
        }

        this.localVector3.SelfMul(wheel.grip / wheel.tensionLimit);
        this.localVector3.SelfRotate(angle)
        body.GetWorldVector(this.localVector3, out)
    }

    tick(dt: number) {
        super.tick(dt)

        this.updateWheelThrottle()
        this.updateWheelAngles()
        this.applyWheelForces(dt)
    }

    calculateEngineTorque(velocity: number) {
        if(velocity <= 0) return this.maxEngineTorque
        const torque = this.enginePower / velocity
        return Math.min(this.maxEngineTorque, torque)
    }

    protected nonStrictSignComparator(a: number, b: number) {
        const aSign = Math.sign(a)
        const bSign = Math.sign(b)

        return aSign == 0 || bSign == 0 || aSign == bSign
    }

    protected updateWheelTorque(wheel: TankWheel, control: number, engineForce: number) {
        if(Math.abs(wheel.groundSpeed) < 0.5 || this.nonStrictSignComparator(control, wheel.groundSpeed)) {
            // Accelerating
            wheel.torque = control * engineForce / this.wheels.length
            wheel.brakeTorque = wheel.idleBrakingTorque
            return
        }

        // Braking
        wheel.torque = 0
        wheel.brakeTorque = Math.abs(control) * wheel.maxBrakingTorque + wheel.idleBrakingTorque
    }

    protected updateWheelThrottle() {
        const throttle = this.controlsComponent.getThrottle()
        const engineTorque = this.calculateEngineTorque(this.getDrivetrainSpeed())

        for(let wheel of this.wheels) {
            if(wheel.isDriving) this.updateWheelTorque(wheel, throttle, engineTorque)
        }
    }

    protected updateWheelAngles() {
        const steerX = this.controlsComponent.getSteer()
        let radius = 0
        if(steerX != 0) {
            radius = 1 / steerX * this.minSteerRadius
        }

        for(let wheel of this.wheels) {
            if(steerX == 0) wheel.angle = 0
            else {
                wheel.angle = Math.atan2(wheel.position.y - this.steerAnchorOffset, radius + wheel.position.x)
                if(wheel.angle > Math.PI / 2) wheel.angle = -Math.PI + wheel.angle
                if(wheel.angle < -Math.PI / 2) wheel.angle = Math.PI + wheel.angle
            }
        }
    }

    protected applyWheelForces(dt: number) {
        const body = this.entity.getComponent(PhysicalComponent).getBody()

        for(let wheel of this.wheels) {
            this.getWheelReaction(wheel, this.localVector1, dt)
            body.GetWorldVector(wheel.position, this.localVector2)

            this.localVector2.SelfAdd(body.GetPosition())
            this.localVector1.SelfNeg()
            body.ApplyForce(this.localVector1, this.localVector2)
        }
    }
}