import {Vec2} from '../../library/box2d'
import TankBehaviour, {TankBehaviourConfig, TankBehaviourDetails} from './tankbehaviour';
import TankModel from "../tankmodel";

interface WheeledTankDetails extends TankBehaviourDetails {
    leftWheelsAngle: number
    rightWheelsAngle: number
    leftWheelsSpeed: number
    rightWheelsSpeed: number
    leftWheelsDist: number
    rightWheelsDist: number
}

export interface TankWheelConfig {
    x: number
    y: number
    friction: number
}

export class TankWheel {
    position: Vec2
    friction: number
    isSliding: boolean = false;
    angle: number = 0
    throttle: number = 0
    tensionVector: Vec2 = new Vec2()
    speed: number = 0
    distance: number = 0

    constructor(config: TankWheelConfig) {
        this.position = new Vec2(config.x, config.y)
        this.friction = config.friction
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
     * Minimum turning radius of the vehicle
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
}

export default class WheeledTankBehaviour extends TankBehaviour {
    public axleDistance: any;
    public axleWidth: any;
    public wheelSpeed: any;
    public wheels: TankWheel[] = []
    public minSteerRadius: number;
    public axles: number;
    public steerAnchorOffset: number;
    public wheelTensionLimit: number;
    public axleOffsetList: number[];
    public axleFrictionList: number[];
    public driveAxleList: boolean[];
    public perWheelPower: number;
    public lateralTensionLossPerMeter: number;

    public details: WheeledTankDetails = {
        clutch: 0,
        transmissionSpeed: 0,
        leftWheelsAngle: 0,
        rightWheelsAngle: 0,
        leftWheelsSpeed: 0,
        rightWheelsSpeed: 0,
        leftWheelsDist: 0,
        rightWheelsDist: 0
    }

    constructor(tank: TankModel, config: WheeledTankBehaviourConfig) {
        super(tank, config)

        this.axleDistance = config.axleDistance || 6
        this.axleWidth = config.axleWidth || 8
        this.wheelSpeed = 9.8
        this.minSteerRadius = config.minSteerRadius || 20
        this.axles = config.axles || 3
        this.axleFrictionList = config.axleFrictionList || this.defaultAxleFrictionList()
        this.axleOffsetList = config.axleOffsets || this.defaultAxleOffsets()
        this.driveAxleList = config.driveAxleList || this.defaultDriveAxleList()
        this.steerAnchorOffset = config.steerAnchorOffset || 0
        this.wheelTensionLimit = config.wheelTensionLimit || 0.3
        this.lateralTensionLossPerMeter = config.lateralTensionLossPerMeter || 0.02

        this.perWheelPower = config.power / this.getDriveWheelCount()

        this.createWheels()
    }

    private getDriveWheelCount() {
        let amount = 0;
        for(let i = 0; i < this.axles; i++) {
            if(this.driveAxleList[i]) amount += 2;
        }
        return amount;
    }

    private defaultAxleFrictionList() {
        let result = []
        let defaultFriction = 25000

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

    private getWheelReaction(wheel: TankWheel, out: Vec2, dt: number) {
        let x = wheel.position.x;
        let y = wheel.position.y;
        let angle = wheel.angle;

        let body = this.tank.body
        this.localVector2.x = x
        this.localVector2.y = y
        body.GetLinearVelocityFromLocalPoint(this.localVector2, this.localVector1)
        body.GetLocalVector(this.localVector1, this.localVector2)
        this.localVector2.SelfRotate(-angle)
        wheel.speed = this.localVector2.y
        this.localVector2.SelfMul(dt)
        this.localVector2.y = 0
        wheel.tensionVector.SelfAdd(this.localVector2)
        wheel.tensionVector.y = -wheel.throttle / wheel.friction * this.wheelTensionLimit

        let tickMovement = wheel.speed * dt
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

        if(wheelTension > this.wheelTensionLimit) {
            wheel.isSliding = true
            wheel.tensionVector.SelfMul(this.wheelTensionLimit / wheelTension)
        } else {
            wheel.isSliding = false
        }

        this.localVector3.Copy(wheel.tensionVector)
        this.localVector3.SelfMulAdd(0.1, this.localVector2)

        this.localVector3.SelfMul(wheel.friction / this.wheelTensionLimit);
        this.localVector3.SelfRotate(angle)
        body.GetWorldVector(this.localVector3, out)
    }

    tick(dt: number) {
        super.tick(dt)
        const tank = this.tank

        let steerY = tank.controls.getThrottle()

        const throttle = this.perWheelPower * steerY

        for(let i = 0; i < this.axles; i++) {
            if(this.driveAxleList[i]) {
                this.wheels[i * 2].throttle = throttle
                this.wheels[i * 2 + 1].throttle = throttle
            }
        }

        this.updateWheelAngles()
        this.applyWheelForces(dt)
    }

    updateWheelAngles() {
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

    applyWheelForces(dt: number) {
        const body = this.tank.body

        for(let wheel of this.wheels) {
            this.getWheelReaction(wheel, this.localVector1, dt)
            body.GetWorldVector(wheel.position, this.localVector2)
            this.localVector2.SelfAdd(body.GetPosition())
            this.localVector1.SelfNeg()
            body.ApplyForce(this.localVector1, this.localVector2)
        }
    }

    countDetails(dt: number) {
        let tank = this.tank
        let body = tank.body
        let steer = tank.controls.getSteer()

        if (steer === 0) {
            this.details.leftWheelsAngle = 0
            this.details.rightWheelsAngle = 0
        } else {
            let radius = 1 / steer * 2

            this.details.leftWheelsAngle = Math.atan2(this.axleDistance, radius + this.axleWidth / 2)
            this.details.rightWheelsAngle = Math.atan2(this.axleDistance, radius - this.axleWidth / 2)

            if (steer < 0) {
                this.details.rightWheelsAngle += Math.PI
                this.details.leftWheelsAngle += Math.PI
            }
        }

        let speed = tank.body.GetLinearVelocity()

        let y2 = -tank.matrix.sin * speed.x + tank.matrix.cos * speed.y
        let angularVelocity = body.GetAngularVelocity()

        let left = (y2 + angularVelocity * this.axleWidth / 2) * this.wheelSpeed
        let right = (y2 - angularVelocity * this.axleWidth / 2) * this.wheelSpeed

        this.details.leftWheelsSpeed = left * dt
        this.details.rightWheelsSpeed = right * dt
        this.details.leftWheelsDist -= left * dt
        this.details.rightWheelsDist -= right * dt
    }
}