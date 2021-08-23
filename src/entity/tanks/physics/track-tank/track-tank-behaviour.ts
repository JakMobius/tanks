
import TankModel from "../../tank-model";
import WheeledTankBehaviour, {WheeledTankBehaviourConfig} from "../wheeled-tank/wheeled-tank-behaviour";
import {clamp} from "../../../../utils/utils";
import WheelTruckGenerator, {TrackConfig} from "./wheel-track-generator";
import {TankWheel} from "../wheeled-tank/wheel";

export type TruckTankBehaviourConfig = Omit<WheeledTankBehaviourConfig, 'wheels'> & {
    /**
     * The longitudinal offset of each track
     */
    trackOffset?: number

    /**
     * The distance between track centers
     */
    trackGauge: number

    /**
     * Single track configuration
     */
    trackConfig: Omit<TrackConfig, 'x' | 'y'>
}

export default class TrackTankBehaviour extends WheeledTankBehaviour {

    leftTrackWheels: TankWheel[]
    rightTrackWheels: TankWheel[]

    constructor(tank: TankModel, config: TruckTankBehaviourConfig) {
        const leftTrackConfig = Object.assign({}, config.trackConfig)
        const rightTrackConfig = Object.assign({}, config.trackConfig)

        const trackOffset = config.trackOffset ?? 0

        const leftTrackWheels = WheelTruckGenerator.generateWheels(Object.assign(leftTrackConfig, {
            x: config.trackGauge / 2,
            y: trackOffset
        }))

        const rightTrackWheels = WheelTruckGenerator.generateWheels(Object.assign(rightTrackConfig, {
            x: -config.trackGauge / 2,
            y: trackOffset
        }))

        super(tank, {
            wheels: [...leftTrackWheels, ...rightTrackWheels],
            ...config
        })

        this.leftTrackWheels = leftTrackWheels
        this.rightTrackWheels = rightTrackWheels
    }

    protected updateWheelAngles() {

    }

    getLeftTrackSpeed() {
        let totalSpeed = 0
        for(let wheel of this.leftTrackWheels) totalSpeed += wheel.speed
        return totalSpeed / this.leftTrackWheels.length
    }

    getRightTrackSpeed() {
        let totalSpeed = 0
        for(let wheel of this.rightTrackWheels) totalSpeed += wheel.speed
        return totalSpeed / this.rightTrackWheels.length
    }

    getLeftTrackGroundSpeed() {
        let result = 0
        for(let wheel of this.leftTrackWheels) {
            if(Math.abs(wheel.groundSpeed) > Math.abs(result)) result = wheel.groundSpeed
        }
        return result
    }

    getRightTrackGroundSpeed() {
        let result = 0
        for(let wheel of this.rightTrackWheels) {
            if(Math.abs(wheel.groundSpeed) > Math.abs(result)) result = wheel.groundSpeed
        }
        return result
    }

    protected updateWheelThrottle() {
        const throttle = this.tank.controls.getThrottle()
        const steer = this.tank.controls.getSteer()

        let leftTrackSpeed = this.getLeftTrackSpeed()
        let rightTrackSpeed = this.getRightTrackSpeed()
        const maximumSpeed = Math.max(Math.abs(leftTrackSpeed), Math.abs(rightTrackSpeed))

        const engineTorque = this.calculateEngineTorque(maximumSpeed)

        let leftTrackSteer = clamp(throttle + steer, -1, 1)
        let rightTrackSteer = clamp(throttle - steer, -1, 1)

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

        const leftTrackGroundSpeed = this.getLeftTrackGroundSpeed()
        const rightTrackGroundSpeed = this.getRightTrackGroundSpeed()


        if(Math.abs(leftTrackGroundSpeed) < 0.5 || this.nonStrictSignComparator(leftTrackGroundSpeed, leftTrackControl)) {
            this.accelerateTrack(this.leftTrackWheels, leftTrackControl, engineTorque)
        } else {
            this.brakeTrack(this.leftTrackWheels, leftTrackControl)
        }

        if(Math.abs(rightTrackGroundSpeed) < 0.5 || this.nonStrictSignComparator(rightTrackGroundSpeed, rightTrackControl)) {
            this.accelerateTrack(this.rightTrackWheels, rightTrackControl, engineTorque)
        } else {
            this.brakeTrack(this.rightTrackWheels, rightTrackControl)
        }
    }

    getLeftTrackDistance() {
        return this.leftTrackWheels[0].distance
    }

    getRightTrackDistance() {
        return this.rightTrackWheels[0].distance
    }

    tick(dt: number) {
        super.tick(dt);

        const leftTrackSpeed = this.getLeftTrackSpeed()
        const rightTrackSpeed = this.getRightTrackSpeed()

        for(let wheel of this.leftTrackWheels) wheel.speed = leftTrackSpeed
        for(let wheel of this.rightTrackWheels) wheel.speed = rightTrackSpeed
    }

    private accelerateTrack(wheels: TankWheel[], control: number, engineForce: number) {
        for(let wheel of wheels) {
            wheel.torque = control * engineForce / this.wheels.length
            wheel.brakeTorque = wheel.idleBrakingTorque
        }
    }

    private brakeTrack(wheels: TankWheel[], control: number) {
        for(let wheel of wheels) {
            wheel.torque = 0
            wheel.brakeTorque = wheel.idleBrakingTorque + Math.abs(control) * wheel.maxBrakingTorque
        }
    }
}