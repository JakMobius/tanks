
import TankModel from "../tank-model";
import WheeledTankBehaviour, {WheeledTankBehaviourConfig} from "./wheeled-tank-behaviour";
import {clamp} from "../../../utils/utils";

export interface TruckTankBehaviourConfig extends WheeledTankBehaviourConfig {
    truckFriction?: number,
    truckLength?: number
}

export default class TrackTankBehaviour extends WheeledTankBehaviour {

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
        for(let i = 0; i < this.axles; i++) totalSpeed += this.wheels[i * 2 + 1].speed
        return totalSpeed / this.axles
    }

    getRightTrackSpeed() {
        let totalSpeed = 0
        for(let i = 0; i < this.axles; i++) totalSpeed += this.wheels[i * 2].speed
        return totalSpeed / this.axles
    }

    protected updateWheelThrottle() {
        const throttle = this.tank.controls.getThrottle()
        const steer = this.tank.controls.getSteer()

        let leftTrackSpeed = this.getLeftTrackSpeed()
        let rightTrackSpeed = this.getRightTrackSpeed()
        const maximumSpeed = Math.max(Math.abs(leftTrackSpeed), Math.abs(rightTrackSpeed))

        const engineTorque = this.calculateEngineTorque(maximumSpeed)

        let leftTrackSteer = clamp(throttle - steer, -1, 1)
        let rightTrackSteer = clamp(throttle + steer, -1, 1)

        let leftTrackTorque = leftTrackSteer
        let rightTrackTorque = rightTrackSteer

        const maximumSteer = Math.max(Math.abs(leftTrackSteer), Math.abs(rightTrackSteer))

        leftTrackTorque = clamp(leftTrackTorque, -1, 1)

        if(maximumSteer > 0) {
            leftTrackSteer /= maximumSteer
            rightTrackSteer /= maximumSteer

            if(maximumSpeed > 0) {
                leftTrackSpeed /= maximumSpeed
                rightTrackSpeed /= maximumSpeed
            }

            const differenceLeft = (leftTrackSteer - leftTrackSpeed) * maximumSteer
            const differenceRight = (rightTrackSteer - rightTrackSpeed) * maximumSteer

            leftTrackTorque += differenceLeft
            rightTrackTorque += differenceRight
        }

        leftTrackTorque = clamp(leftTrackTorque, -1, 1)
        rightTrackTorque = clamp(rightTrackTorque, -1, 1)

        if(Math.sign(leftTrackTorque) === Math.sign(leftTrackSpeed)) {
            leftTrackTorque *= engineTorque / this.axles
        } else {
            leftTrackTorque *= this.brakeForce / this.axles
        }

        if(Math.sign(rightTrackTorque) === Math.sign(rightTrackSpeed)) {
            rightTrackTorque *= engineTorque / this.axles
        } else {
            rightTrackTorque *= this.brakeForce / this.axles
        }

        for(let i = 0; i < this.axles; i++) {
            this.wheels[i * 2 + 1].torque = leftTrackTorque
            this.wheels[i * 2].torque = rightTrackTorque
        }
    }

    getLeftTrackDistance() {
        return this.wheels[0].distance
    }

    getRightTrackDistance() {
        return this.wheels[1].distance
    }
}