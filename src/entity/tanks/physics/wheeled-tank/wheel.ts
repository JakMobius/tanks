import {Vec2} from "../../../../library/box2d";

export interface TankWheelConfig {
    x: number
    y: number

    /**
     * Maximum wheel surface friction (in newtons)
     */
    grip?: number

    /**
     * The mass of this wheel (in kilograms)
     */
    mass?: number

    /**
     * Indicator of whether this wheel is the drive wheel
     */
    isDriving?: boolean

    /**
     * Maximum wheel brake force (in newtons)
     */
    maxBrakingTorque?: number

    /**
     * How much the wheel resists longitudinal movement (in newtons)
     */
    idleBrakingTorque?: number

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

export class TankWheel {
    // Configuration values
    readonly position: Vec2
    readonly grip: number
    readonly mass: number
    readonly isDriving: boolean;
    readonly maxBrakingTorque: number;
    readonly idleBrakingTorque: number;
    readonly lateralTensionLossPerMeter: number;
    readonly tensionLimit: number;

    // Dynamic values
    angle: number = 0
    tensionVector: Vec2 = new Vec2()

    speed: number = 0
    distance: number = 0
    groundSpeed: number = 0;

    isSliding: boolean = false;

    torque: number = 0
    brakeTorque: number = 0

    constructor(config: TankWheelConfig) {
        this.position = new Vec2(config.x, config.y)
        this.grip = config.grip ?? 100
        this.mass = config.mass ?? 100
        this.isDriving = config.isDriving ?? true
        this.maxBrakingTorque = config.maxBrakingTorque ?? 0
        this.idleBrakingTorque = config.idleBrakingTorque ?? 0
        this.lateralTensionLossPerMeter = config.lateralTensionLossPerMeter ?? 0.02
        this.tensionLimit = config.tensionLimit ?? 0.08
    }
}