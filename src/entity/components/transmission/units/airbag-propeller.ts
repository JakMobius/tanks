import TransmissionUnit from "src/entity/components/transmission/units/transmission-unit";
import * as Box2D from "@box2d/core";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";

export interface AirbagPropellerConfig {
    momentum?: number

    x: number
    y: number

    // Tells how much airspeed (in m/s) should be generated
    // by the propeller at 1 radian per second. Default is 0.1
    angleSetting?: number

    // Tells how much engine energy gets converted to the movement
    // of the vehicle by the propeller. Default is 0.5
    efficiency?: number

    // Tells how much force is generated from 1 m/s difference
    // between vehicle airspeed and propeller output speed.
    // Also affects the rotational resistance for the engine.
    // This value should be calculated by the propeller size
    // and the atmosphere density. Default is 5
    resistance?: number

    angle?: number

    ruderAngle?: number

    steeringAngle?: number
}

export class AirbagPropeller extends TransmissionUnit {
    public angleSetting: number
    public efficiency: number
    public position: Box2D.XY
    public resistance: number
    public angle: number = 0
    public ruderAngle: number
    public steeringAngle: number
    public momentum: number

    public unitIndex: number

    private direction: Box2D.XY = {x: 1, y: 0}
    private ruderDirection: Box2D.XY = {x: 1, y: 0}

    constructor(config: AirbagPropellerConfig) {
        super()
        this.efficiency = config.efficiency ?? 0.5
        this.angleSetting = config.angleSetting ?? 0.1
        this.resistance = config.resistance ?? 0.1
        this.position = {x: config.x ?? 0, y: config.y ?? 0}
        this.momentum = config.momentum ?? 1
        this.steeringAngle = config.steeringAngle ?? Math.PI / 4
        this.setAngle(config.angle ?? 0)
        this.setRuderAngle(config.ruderAngle ?? 0)
    }

    onTick(dt: number) {
        super.onTick(dt);
    }

    onAttach(transmission: TransmissionComponent) {
        this.unitIndex = this.transmission.system.addValue(0, 0, this.momentum)
    }

    setAngle(angle: number) {
        if (this.angle !== angle) {
            this.angle = angle
            this.direction = {x: Math.cos(this.angle), y: Math.sin(this.angle)}

            this.ruderAngle = undefined
            this.setRuderAngle(this.ruderAngle)
        }
    }

    getDirection() {
        return this.direction
    }

    setRuderAngle(angle: number) {
        if (this.ruderAngle !== angle) {
            this.ruderAngle = angle
            this.ruderDirection = {x: Math.cos(this.ruderAngle + this.angle), y: Math.sin(this.ruderAngle + this.angle)}
        }
    }

    getRuderDirection() {
        return this.ruderDirection
    }

    getDistance() {
        return this.transmission.system.q[this.unitIndex]
    }
}