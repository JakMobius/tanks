import {clamp, siValueFromHorsepower, siValueFromRPM, rpmFromSiValue} from "src/utils/utils";
import TransmissionUnit from "./transmission-unit";
import TransmissionComponent from "../transmission-component";

export interface TorquePoint {
    rpm: number;
    torque: number;
}

export interface EngineConfig {
    flywheelMomentum?: number
    cutoffEngineSpeed?: number
    engineDrag?: number
    cutoffTime?: number
    idleStrokeLow?: number
    idleStrokeHigh?: number
    torqueMap?: TorquePoint[]
}

export default class TankEngineUnit extends TransmissionUnit {

    cutoffEngineSpeed: number
    cutoffTime: number
    idleStrokeLow: number
    idleStrokeHigh: number
    torqueMap: TorquePoint[] = []

    unitIndex: number
    private flywheelMomentum: number
    private torque: number
    private engineThrottle: number = 0;
    cutoffTimeLeft: number = 0
    private inputThrottle: number = 0
    private enabled: boolean = true

    constructor(config: EngineConfig) {
        super();

        this.setConfig(config)
    }

    /**
     * Get the torque value at a specific RPM based on the torque map
     * If torque map is empty, falls back to the legacy calculation using maxTorque and power
     */
    getTorqueAtRpm(rpm: number): number {
        let map = this.torqueMap
        
        // If RPM is less than the lowest point in map
        if (rpm <= map[0].rpm) {
            return map[0].torque;
        }
        
        // If RPM is greater than the highest point in map
        if (rpm >= map[map.length - 1].rpm) {
            return map[map.length - 1].torque;
        }
        
        // Find the two closest points and interpolate
        for (let i = 0; i < map.length - 1; i++) {
            if (rpm >= map[i].rpm && rpm <= map[i + 1].rpm) {
                const lowerPoint = map[i];
                const upperPoint = map[i + 1];
                
                // Linear interpolation
                const ratio = (rpm - lowerPoint.rpm) / (upperPoint.rpm - lowerPoint.rpm);
                return lowerPoint.torque + ratio * (upperPoint.torque - lowerPoint.torque);
            }
        }
        
        // Fallback (should not reach here)
        return 0;
    }

    onTick(dt: number) {
        let flywheelSpeed = this.getFlywheelRotationSpeed()
        let torque = 0

        if (this.cutoffTimeLeft <= 0 && this.enabled) {
            let throttle = this.inputThrottle
            if (flywheelSpeed < this.idleStrokeHigh) {
                let normalizedIdleSpeed =
                    (flywheelSpeed - this.idleStrokeLow) /
                    (this.idleStrokeHigh - this.idleStrokeLow)
                throttle += clamp(1 - normalizedIdleSpeed, 0, 1)
            }
            if (flywheelSpeed > this.cutoffEngineSpeed) {
                this.cutoffTimeLeft = this.cutoffTime
                throttle = 0
            }
            this.engineThrottle = throttle
            
            // Use the torque map to get the torque at current RPM
            const rpmValue = rpmFromSiValue(flywheelSpeed);
            const maxTorqueAtRpm = this.getTorqueAtRpm(rpmValue);
            
            if (flywheelSpeed <= 0) {
                torque = maxTorqueAtRpm;
            } else {
                torque = Math.min(maxTorqueAtRpm, torque + maxTorqueAtRpm * throttle);
            }
        } else {
            this.engineThrottle = 0
        }

        this.cutoffTimeLeft -= dt

        this.torque = torque
        this.transmission.system.Q[this.unitIndex] += torque
    }

    getFlywheelRotationSpeed() {
        return this.transmission.system.qdot[this.unitIndex]
    }

    getMaxRotationSpeed() {
        return this.cutoffEngineSpeed
    }

    getActualEngineThrottle() {
        return this.engineThrottle
    }

    getThrottle() {
        return this.inputThrottle
    }

    getTorque() {
        return this.torque
    }

    setThrottle(throttle: number) {
        this.inputThrottle = clamp(throttle, 0, 1)
    }

    setConfig(config: EngineConfig) {
        config = Object.assign({
            flywheelMomentum: 1.0,
            cutoffTime: 0.1,
            gears: [{ gearing: 1 }],
            cutoffEngineSpeed: siValueFromRPM(4500),
            idleStrokeLow: siValueFromRPM(600),
            idleStrokeHigh: siValueFromRPM(800),
            torqueMap: [
                {rpm: siValueFromRPM(1000), torque: 50},
                {rpm: siValueFromRPM(2000), torque: 60},
                {rpm: siValueFromRPM(3000), torque: 70},
                {rpm: siValueFromRPM(4000), torque: 80},
                {rpm: siValueFromRPM(5000), torque: 20},
            ]
        }, config)

        this.flywheelMomentum = config.flywheelMomentum
        this.cutoffEngineSpeed = config.cutoffEngineSpeed
        this.cutoffTime = config.cutoffTime
        this.idleStrokeLow = config.idleStrokeLow
        this.idleStrokeHigh = config.idleStrokeHigh
        this.torqueMap = config.torqueMap
    }

    onAttach(transmission: TransmissionComponent) {
        this.unitIndex = this.transmission.system.addValue(0, 0, this.flywheelMomentum)
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled
    }
}