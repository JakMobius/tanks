import {Vec2} from '../../../library/box2d'
import TankBehaviour, {TankBehaviourConfig} from './tank-behaviour';
import TankModel from "../tank-model";

export interface TankWheelConfig {
    x: number
    y: number
    friction: number
    mass?: number
}

export class TankWheel {
    position: Vec2
    friction: number
    isSliding: boolean = false;
    angle: number = 0
    torque: number = 0
    tensionVector: Vec2 = new Vec2()
    speed: number = 0
    distance: number = 0
    mass: number

    constructor(config: TankWheelConfig) {
        this.position = new Vec2(config.x, config.y)
        this.friction = config.friction
        this.mass = config.mass ?? 100
    }
}

export interface WheeledTankBehaviourConfig extends TankBehaviourConfig {
    driveAxleList?: boolean[];
    wheelSlideFriction?: number;

    /**
     * Amount of wheel axles (single axle holds two wheels)
     */
    axles?: number,

    /**
     * Distance between axles. This value will be used
     * if axleOffsets field is omitted.
     */

    axleDistance?: number,

    /**
     * The distance between wheels on each axle
     */

    axleWidth?: number,

    /**
     * Array of friction factors for the wheels of each axle
     */
    axleFrictionList?: number[]

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

    /**
     * The offset of the axes in the longitudinal
     * axis of the vehicle relative to its center
     */
    axleOffsets?: number[]

    /**
     * This value specifies how much the fixed
     * wheel allows the vehicle to move relative
     * to the ground without sliding (in meters).
     * In reality, this is possible due to the
     * elasticity of tire rubber. In simulation
     * this allows to calculate wheel forces more
     * precisely. The closer this value is to zero,
     * the lower the time delta must be for the
     * simulation to remain realistic.
     */
    wheelTensionLimit?: number

    /**
     * This value specifies the loss rate of lateral
     * tension per meter. When wheel rolls, it looses
     * its lateral tension. This can be felt when
     * turning at high speed on a bicycle with an
     * underinflated rear wheel. It will feel like
     * drifting. In the simulation it prevents rolling
     * vehicle from wobbling, which looks unnatural.
     * This value does not affect performance.
     */
    lateralTensionLossPerMeter?: number

    /**
     * This value determines how hard the vehicle is
     * braking (in newtons). Defaults to maxTorque
     */
    brakeForce?: number
}

export default class WheeledTankBehaviour extends TankBehaviour {
    public axleDistance: number;
    public axleWidth: number;
    public wheels: TankWheel[] = []
    public minSteerRadius: number;
    public axles: number;
    public steerAnchorOffset: number;
    public wheelTensionLimit: number;
    public axleOffsetList: number[];
    public axleFrictionList: number[];
    public driveAxleList: boolean[];
    public driveWheelCount: number
    public lateralTensionLossPerMeter: number;
    public brakeForce: number

    constructor(tank: TankModel, config: WheeledTankBehaviourConfig) {
        super(tank, config)

        this.axleDistance = config.axleDistance || 6
        this.axleWidth = config.axleWidth || 8
        this.minSteerRadius = config.minSteerRadius || 20
        this.axles = config.axles || 3
        this.axleFrictionList = config.axleFrictionList || this.defaultAxleFrictionList(config.wheelSlideFriction)
        this.axleOffsetList = config.axleOffsets || this.defaultAxleOffsets()
        this.driveAxleList = config.driveAxleList || this.defaultDriveAxleList()
        this.steerAnchorOffset = config.steerAnchorOffset || 0
        this.wheelTensionLimit = config.wheelTensionLimit || 0.3
        this.lateralTensionLossPerMeter = config.lateralTensionLossPerMeter || 0.02
        this.brakeForce = config.brakeForce || this.maxTorque

        this.driveWheelCount = this.calculateDriveWheelCount()

        this.createWheels()
    }

    /**
     * @returns number average speed of all driving wheels
     */
    getDrivetrainSpeed(): number {
        let totalSpeed = 0
        for(let i = 0; i < this.axles; i++) {
            if(this.driveAxleList[i]) {
                totalSpeed += this.wheels[i * 2].speed
                totalSpeed += this.wheels[i * 2 + 1].speed
            }
        }
        return Math.abs(totalSpeed / this.driveWheelCount)
    }

    private calculateDriveWheelCount() {
        let result = 0;
        for(let i = 0; i < this.axles; i++) {
            if(this.driveAxleList[i]) result += 2;
        }
        return result;
    }

    private defaultAxleFrictionList(friction?: number) {
        let result = []
        let defaultFriction = friction ?? 250000

        for(let i = 0; i < this.axles; i++) result.push(defaultFriction)

        return result
    }

    private defaultAxleOffsets() {
        let result = [];
        let axleY = -this.axleDistance * (this.axles - 1) / 2
        for(let axle = 0; axle < this.axles; axle++) {
            result.push(axleY)
            axleY += this.axleDistance
        }
        return result
    }

    private defaultDriveAxleList() {
        let result = []
        for(let i = 0; i < this.axles; i++) result.push(true)
        return result
    }

    private createWheels() {

        for(let i = 0; i < this.axles; i++) {
            let axleOffset = this.axleOffsetList[i]
            let axleFriction = this.axleFrictionList[i]
            this.wheels.push(new TankWheel({
                x: this.axleWidth,
                y: axleOffset,
                friction: axleFriction
            }))
            this.wheels.push(new TankWheel({
                x: -this.axleWidth,
                y: axleOffset,
                friction: axleFriction
            }))
        }
    }

    private getWheelTensionFromForce(wheel: TankWheel, force: number) {
        return force / wheel.friction * this.wheelTensionLimit
    }

    private getWheelForceFromTension(wheel: TankWheel, tension: number) {
        return tension * wheel.friction / this.wheelTensionLimit
    }

    private getWheelReaction(wheel: TankWheel, out: Vec2, dt: number) {
        let x = wheel.position.x;
        let y = wheel.position.y;
        let angle = wheel.angle;

        let body = this.tank.getBody()
        this.localVector2.x = x
        this.localVector2.y = y

        // set localVector1 to world-space velocity of the wheel
        body.GetLinearVelocityFromLocalPoint(this.localVector2, this.localVector1)

        // set localVector2 to vehicle-space velocity of the wheel
        body.GetLocalVector(this.localVector1, this.localVector2)

        // set localVector2 to wheel-space velocity of the wheel
        this.localVector2.SelfRotate(-angle)

        // set localVector2 to wheel-space translation of the wheel on this tick
        this.localVector2.SelfMul(dt)

        let tickMovement = wheel.speed * dt

        wheel.tensionVector.SelfAdd(this.localVector2)
        wheel.tensionVector.y -= tickMovement
        wheel.distance += tickMovement

        let tickDistance = Math.abs(tickMovement)

        // Simulating lateral tension loss

        if(wheel.tensionVector.x > 0) {
            wheel.tensionVector.x -= tickDistance * this.lateralTensionLossPerMeter
            if(wheel.tensionVector.x < 0) wheel.tensionVector.x = 0
        } else if(wheel.tensionVector.x < 0) {
            wheel.tensionVector.x += tickDistance * this.lateralTensionLossPerMeter
            if(wheel.tensionVector.x > 0) wheel.tensionVector.x = 0
        }

        // If wheel has too much tension, it will start
        // to slide. Simulating it by limiting tension vector

        let wheelTension = wheel.tensionVector.Length()

        wheel.isSliding = wheelTension > this.wheelTensionLimit

        if(wheel.isSliding) {
            wheel.tensionVector.SelfMul(this.wheelTensionLimit / wheelTension)
        }

        const totalWheelTorque = wheel.torque + this.getWheelForceFromTension(wheel, wheel.tensionVector.y)
        wheel.speed += totalWheelTorque / wheel.mass * dt

        this.localVector3.Copy(wheel.tensionVector)

        // Decreasing wheel reaction if the vehicle is moving back to its neutral position
        let projection = this.localVector2.x / wheel.tensionVector.x
        if(projection < 0) {
            this.localVector3.x /= (1 - projection * 10);
        }

        this.localVector3.SelfMul(wheel.friction / this.wheelTensionLimit);
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
        if(velocity <= 0) return this.maxTorque
        const torque = this.power / velocity
        return Math.min(this.maxTorque, torque)
    }

    protected updateWheelThrottle() {
        const throttle = this.tank.controls.getThrottle()
        const engineTorque = this.calculateEngineTorque(this.getDrivetrainSpeed()) * throttle
        const wheelTorque = engineTorque / this.driveWheelCount

        for(let i = 0; i < this.axles; i++) {
            if(this.driveAxleList[i]) {
                this.wheels[i * 2].torque = wheelTorque
                this.wheels[i * 2 + 1].torque = wheelTorque
            }
        }
    }

    protected updateWheelAngles() {
        const steerX = this.tank.controls.getSteer()
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
        const body = this.tank.getBody()

        for(let wheel of this.wheels) {
            this.getWheelReaction(wheel, this.localVector1, dt)
            body.GetWorldVector(wheel.position, this.localVector2)

            this.localVector2.SelfAdd(body.GetPosition())
            this.localVector1.SelfNeg()
            body.ApplyForce(this.localVector1, this.localVector2)
        }
    }
}