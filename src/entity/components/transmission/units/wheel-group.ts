import {Vec2, XY} from "src/library/box2d";
import TransmissionUnit from "src/entity/components/transmission/units/transmission-unit";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import BrakeConstraint from "src/entity/components/transmission/constraints/brake-constraint";

export interface TankWheelConfig {
    x: number
    y: number

    /**
     * Maximum wheel surface friction (in newtons)
     */
    grip?: number

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
    tensionLimit?: number
}

export interface TankWheelGroupConfig {
    wheels: TankWheelConfig[]

    /**
     * The inertia of this wheel group
     */
    momentum?: number

    /**
     * Maximum wheel brake force (in newtons)
     */
    maxBrakingTorque?: number

    /**
     * How much the wheel resists longitudinal movement (in newtons)
     */
    idleBrakingTorque?: number

    radius?: number

    transmission?: TransmissionComponent
}

export class Wheel {
    x: number
    y: number
    angle: number = 0
    grip: number

    tensionVector: Vec2 = new Vec2()
    groundSpeed: number = 0;
    slideVelocity: number = 0

    lateralTensionLossPerMeter: number
    tensionLimit: number

    group: WheelGroup

    constructor(config: TankWheelConfig) {
        this.x = config.x
        this.y = config.y

        this.grip = config.grip ?? 100
        this.lateralTensionLossPerMeter = config.lateralTensionLossPerMeter ?? 0.02
        this.tensionLimit = config.tensionLimit ?? 0.08
    }
}

export class WheelGroup extends TransmissionUnit {
    // Configuration values
    readonly wheels: Wheel[]
    readonly maxBrakingTorque: number
    readonly idleBrakingTorque: number
    readonly radius: number
    readonly circumference: number
    readonly momentum: number

    unitIndex: number
    brakeConstraint: BrakeConstraint | null = null

    constructor(config: TankWheelGroupConfig) {
        super()

        this.wheels = config.wheels.map((config) => {
            let wheel = new Wheel(config)
            wheel.group = this
            return wheel
        })
        this.momentum = config.momentum ?? 30
        this.maxBrakingTorque = config.maxBrakingTorque ?? 0
        this.idleBrakingTorque = config.idleBrakingTorque ?? 0
        this.radius = config.radius ?? 0.5
        this.circumference = 2 * Math.PI * this.radius
    }

    onTick(dt: number) {

    }

    onAttach(transmission: TransmissionComponent) {
        this.unitIndex = transmission.system.addValue(0, 0, this.momentum)
        this.brakeConstraint = new BrakeConstraint(this.unitIndex)
        transmission.system.addConstraint(this.brakeConstraint)
    }

    setBrake(brake: number) {
        this.brakeConstraint.setBrakeTorque(this.idleBrakingTorque + this.maxBrakingTorque * brake)
    }

    getDistance() {
        return this.transmission.system.q[this.unitIndex] * this.circumference
    }
}