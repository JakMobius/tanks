
import TankModel from "../tank-model";
import WheeledTankBehaviour, {WheeledTankBehaviourConfig} from "./wheeled-tank-behaviour";
import {clamp} from "../../../utils/utils";

export interface TruckTankBehaviourConfig extends WheeledTankBehaviourConfig {
    truckFriction?: number,
    truckLength?: number
}

export default class TruckTankBehaviour extends WheeledTankBehaviour {

    constructor(tank: TankModel, config: TruckTankBehaviourConfig) {

        if(config.axles === undefined) config.axles = 5
        if(config.truckLength) config.axleDistance = config.truckLength / config.axles
        if(config.wheelTensionLimit === undefined) config.wheelTensionLimit = 0.05
        if(config.truckFriction) config.wheelSlideFriction = config.truckFriction / config.axles

        super(tank, config)
    }

    protected updateWheelAngles() {

    }

    getLeftTrackSpeed() {
        let totalSpeed = 0
        for(let i = 0; i < this.axles; i++) totalSpeed += this.wheels[i * 2].speed
        return Math.abs(totalSpeed / this.axles)
    }

    getRightTrackSpeed() {
        let totalSpeed = 0
        for(let i = 0; i < this.axles; i++) totalSpeed += this.wheels[i * 2 + 1].speed
        return Math.abs(totalSpeed / this.axles)
    }

    protected updateWheelThrottle() {
        const steerY = this.tank.controls.getThrottle()
        const steerX = this.tank.controls.getSteer()

        let leftTruckThrottle = clamp(steerY - steerX, -1, 1)
        let rightTruckThrottle = clamp(steerY + steerX, -1, 1)

        const leftTruckSpeed = this.getLeftTrackSpeed()
        const rightTruckSpeed = this.getRightTrackSpeed()

        if(Math.abs(steerY) < 0.5) {
            if(Math.abs(steerX) > 0.5) {
                const steerFactor = Math.abs(steerX) - 0.5
                const breakFactor = steerFactor - Math.abs(steerY)

                if(breakFactor > 0) {
                    if (steerX < 0) {
                        if (leftTruckSpeed > 0) leftTruckThrottle -= breakFactor
                        else leftTruckThrottle += breakFactor
                    } else {
                        if (rightTruckSpeed > 0) rightTruckThrottle -= breakFactor
                        else rightTruckThrottle += breakFactor
                    }
                }
            }
        }

        const engineTorque = this.calculateEngineTorque(leftTruckSpeed + rightTruckSpeed)

        const leftTrackTorque = engineTorque * leftTruckThrottle / this.axles
        const rightTruckTorque = engineTorque * rightTruckThrottle / this.axles

        for(let i = 0; i < this.axles; i++) {
            this.wheels[i * 2 + 1].torque = leftTrackTorque
            this.wheels[i * 2].torque = rightTruckTorque
        }
    }

    getLeftTrackDistance() {
        return this.wheels[0].distance
    }

    getRightTrackDistance() {
        return this.wheels[1].distance
    }
}