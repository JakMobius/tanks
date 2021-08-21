
import TankModel from "../tank-model";
import WheeledTankBehaviour, {TankWheel, WheeledTankBehaviourConfig} from "./wheeled-tank-behaviour";
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

        let leftTrackControl = leftTrackSteer
        let rightTrackControl = rightTrackSteer

        const maximumSteer = Math.max(Math.abs(leftTrackSteer), Math.abs(rightTrackSteer))

        leftTrackControl = clamp(leftTrackControl, -1, 1)

        if(maximumSteer > 0) {
            leftTrackSteer /= maximumSteer
            rightTrackSteer /= maximumSteer

            if(maximumSpeed > 0) {
                leftTrackSpeed /= maximumSpeed
                rightTrackSpeed /= maximumSpeed
            }

            const differenceLeft = (leftTrackSteer - leftTrackSpeed) * maximumSteer
            const differenceRight = (rightTrackSteer - rightTrackSpeed) * maximumSteer

            leftTrackControl += differenceLeft
            rightTrackControl += differenceRight
        }

        leftTrackControl = clamp(leftTrackControl, -1, 1)
        rightTrackControl = clamp(rightTrackControl, -1, 1)

        for(let i = 0; i < this.axles; i++) {
            this.updateWheelTorque(this.wheels[i * 2 + 1], leftTrackControl, engineTorque)
            this.updateWheelTorque(this.wheels[i * 2], rightTrackControl, engineTorque)
        }
    }

    getLeftTrackDistance() {
        return this.wheels[0].distance
    }

    getRightTrackDistance() {
        return this.wheels[1].distance
    }

    tick(dt: number) {
        super.tick(dt);

        const leftTrackSpeed = this.getLeftTrackSpeed()
        const rightTrackSpeed = this.getRightTrackSpeed()

        for(let i = 0; i < this.axles; i++) {
            this.wheels[i * 2 + 1].speed = leftTrackSpeed
            this.wheels[i * 2].speed = rightTrackSpeed
        }
    }
}