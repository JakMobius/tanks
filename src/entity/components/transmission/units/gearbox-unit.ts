import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import {clamp, siValueFromRPM} from "src/utils/utils";
import TransmissionUnit from "src/entity/components/transmission/units/transmission-unit";
import {GearConstraint} from "src/entity/components/transmission/constraints/gear-constraint";

export interface GearboxUnitConfig {
    gears?: EngineGearConfig[]
    clutchStrokeLow?: number
    clutchStrokeHigh?: number
    outputShaftUnitMomentum?: number
    clutchTorque?: number
}

export interface EngineGearConfig {
    /// When should gearbox switch to the next gear
    high?: number

    /// When should gearbox switch to the previous gear
    low?: number

    /// Gear ratio
    gearing: number
}

export default class GearboxUnit extends TransmissionUnit {
    gears: EngineGearConfig[];
    private clutchStrokeLow: number;
    private clutchStrokeHigh: number;
    private shiftCooldownLeft: number = 0;
    private shiftCooldown: number = 0.3;
    private gearIndex = 0;

    clutchTorque: number
    outputShaftMomentum: number
    outputUnitIndex: number
    gearboxConstraint: GearConstraint

    inputUnitIndex: number

    private shouldReverse: boolean = false;

    constructor(config: GearboxUnitConfig) {
        super();

        config = Object.assign({
            gears: [{gearing: 1}],
            clutchStrokeLow: siValueFromRPM(1000),
            clutchStrokeHigh: siValueFromRPM(2000),
            outputShaftUnitMomentum: 1,
            clutchTorque: 3000
        }, config)

        this.gears = config.gears
        this.clutchStrokeLow = config.clutchStrokeLow
        this.clutchStrokeHigh = config.clutchStrokeHigh
        this.outputShaftMomentum = config.outputShaftUnitMomentum
        this.clutchTorque = config.clutchTorque
    }

    onTick(dt: number) {
        if (this.shiftCooldownLeft > 0) {
            this.shiftCooldownLeft -= dt
            if (this.shiftCooldownLeft < 0) this.shiftCooldownLeft = 0
        }

        const engineRPM = this.inputUnitIndex === null ? 0 : this.transmission.system.qdot[this.inputUnitIndex]
        const clutchOutputRPM = this.transmission.system.qdot[this.outputUnitIndex] * this.gears[this.gearIndex].gearing

        let normalizedEffectiveSpeed =
            (engineRPM - this.clutchStrokeLow) /
            (this.clutchStrokeHigh - this.clutchStrokeLow)

        let clutchFactor = clamp(normalizedEffectiveSpeed, 0, 1)
        let gearing = 0

        const currentGear = this.gears[this.gearIndex];
        const nextGear = this.gears[this.gearIndex + 1];
        const previousGear = this.gears[this.gearIndex - 1];

        if (this.shouldReverse) {
            gearing = -this.gears[0].gearing
        } else {
            if (this.shiftCooldownLeft === 0) {
                if (previousGear && clutchOutputRPM < currentGear.low) {
                    this.shiftDown()
                } else if (nextGear && clutchOutputRPM > currentGear.high) {
                    this.shiftUp()
                }
            }

            gearing = this.gears[this.gearIndex].gearing
        }

        if (this.gearboxConstraint) {
            this.gearboxConstraint.setCoefficient(gearing)
            this.gearboxConstraint.setMaxTorque(clutchFactor * this.clutchTorque)
        }

        // const torque = this.transmission.system.lambda[this.gearboxConstraint.index]
        // DebugDrawer.instance.plotData.plot(0xFFFF0000, torque / this.clutchTorque, Date.now() / 1000)

        // let gearboxInputSpeed = this.transmission.system.qdot[this.inputUnitIndex]
        // let gearboxOutputSpeed = this.transmission.system.qdot[this.outputUnitIndex]

        // let coeff = 0.05

        // DebugDrawer.instance.plotData.plot(0xFF0000FF, gearboxInputSpeed * coeff / gearing, Date.now() / 1000)
        // DebugDrawer.instance.plotData.plot(0xFF000077, gearboxOutputSpeed * coeff, Date.now() / 1000)
        // DebugDrawer.instance.plotData.plot(0xFF00FFFF, this.gearIndex / 4, Date.now() / 1000)
        // DebugDrawer.instance.plotData.plot(0xFFFFFF00, clutchFactor, Date.now() / 1000)
    }

    shiftUp() {
        this.shiftCooldownLeft = this.shiftCooldown
        this.gearIndex++
        this.transmission.entity.emit("gearbox-shift", this)
    }

    shiftDown() {
        this.shiftCooldownLeft = this.shiftCooldown
        this.gearIndex--
        this.transmission.entity.emit("gearbox-shift", this)
    }

    onAttach(transmission: TransmissionComponent) {
        this.outputUnitIndex = this.transmission.system.addValue(0, 0, this.outputShaftMomentum)
    }

    attachToInputUnit(inputUnitIndex: number) {
        this.inputUnitIndex = inputUnitIndex
        this.gearboxConstraint = new GearConstraint(1, this.outputUnitIndex, this.inputUnitIndex)
        this.transmission.system.addConstraint(this.gearboxConstraint)
    }

    getCurrentGear() {
        return this.gearIndex
    }

    setShouldReverse(shouldReverse: boolean) {
        if (this.shouldReverse !== shouldReverse) {
            this.shouldReverse = shouldReverse
            this.transmission.entity.emit("gearbox-shift", this)
        }
    }

    getShouldReverse() {
        return this.shouldReverse
    }
}