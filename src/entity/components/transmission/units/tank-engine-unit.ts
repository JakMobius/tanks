import {clamp, siValueFromHorsepower, siValueFromRPM} from "src/utils/utils";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import TransmissionUnit from "src/entity/components/transmission/units/transmission-unit";

export interface EngineConfig {
    maxTorque?: number
    power?: number
    flywheelMomentum?: number
    maxEngineSpeed?: number
    engineDrag?: number
    cutoffTime?: number
    idleStrokeLow?: number
    idleStrokeHigh?: number
}

export default class TankEngineUnit extends TransmissionUnit {

    power: number
    maxTorque: number
    maxEngineSpeed: number
    engineDrag: number
    cutoffTime: number
    idleStrokeLow: number
    idleStrokeHigh: number

    unitIndex: number
    private flywheelMomentum: number
    private engineThrottle: number = 0;
    cutoffTimeLeft: number = 0
    private inputThrottle: number = 0
    private enabled: boolean = true

    constructor(config: EngineConfig) {
        super();

        config = Object.assign({
            maxTorque: 1500,
            power: siValueFromHorsepower(1000),
            flywheelMomentum: 1.0,
            engineDrag: 0.7,
            cutoffTime: 0.1,
            gears: [{ gearing: 1 }],
            maxEngineSpeed: siValueFromRPM(4500),
            idleStrokeLow: siValueFromRPM(600),
            idleStrokeHigh: siValueFromRPM(800),
        }, config)

        this.flywheelMomentum = config.flywheelMomentum
        this.maxTorque = config.maxTorque;
        this.power = config.power
        this.maxEngineSpeed = config.maxEngineSpeed
        this.engineDrag = config.engineDrag
        this.cutoffTime = config.cutoffTime
        this.idleStrokeLow = config.idleStrokeLow
        this.idleStrokeHigh = config.idleStrokeHigh
    }

    onTick(dt: number) {
        let flywheelSpeed = this.getFlywheelRotationSpeed()
        let torque = -this.engineDrag * flywheelSpeed

        if (this.cutoffTimeLeft <= 0 && this.enabled) {
            let throttle = this.inputThrottle
            if (flywheelSpeed < this.idleStrokeHigh) {
                let normalizedIdleSpeed =
                    (flywheelSpeed - this.idleStrokeLow) /
                    (this.idleStrokeHigh - this.idleStrokeLow)
                throttle += clamp(1 - normalizedIdleSpeed, 0, 1)
            }
            if (flywheelSpeed > this.maxEngineSpeed) {
                this.cutoffTimeLeft = this.cutoffTime
                throttle = 0
            }
            this.engineThrottle = throttle
            if (flywheelSpeed <= 0) {
                torque += this.maxTorque
            } else {
                torque = Math.min(this.maxTorque, torque + this.power / flywheelSpeed * throttle)
            }
        } else {
            this.engineThrottle = 0
        }

        this.cutoffTimeLeft -= dt

        this.transmission.system.Q[this.unitIndex] += torque
    }

    getFlywheelRotationSpeed() {
        return this.transmission.system.qdot[this.unitIndex]
    }

    getMaxRotationSpeed() {
        return this.maxEngineSpeed
    }

    getActualEngineThrottle() {
        return this.engineThrottle
    }

    getThrottle() {
        return this.inputThrottle
    }

    setThrottle(throttle: number) {
        this.inputThrottle = clamp(throttle, 0, 1)
    }

    onAttach(transmission: TransmissionComponent) {
        this.unitIndex = this.transmission.system.addValue(0, 0, this.flywheelMomentum)
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled
    }
}