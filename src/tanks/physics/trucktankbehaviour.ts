
import TankModel from "../tankmodel";
import WheeledTankBehaviour, {WheeledTankBehaviourConfig} from "./wheeledtankbehaviour";
import Utils from "../../utils/utils";

export interface TruckTankBehaviourConfig extends WheeledTankBehaviourConfig {
    truckFriction?: number,
    truckLength?: number
}

export default class TruckTankBehaviour extends WheeledTankBehaviour {

    constructor(tank: TankModel, config: TruckTankBehaviourConfig) {

        if(config.axles === undefined) config.axles = 5
        if(config.truckLength) config.axleDistance = config.truckLength / config.axles
        if(config.wheelTensionLimit === undefined) config.wheelTensionLimit = 0.05
        if(config.truckFriction) config.wheelSlideFriction = config.wheelTensionLimit / config.axles

        super(tank, config)
    }

    protected updateWheelAngles() {

    }

    protected updateWheelThrottle() {
        let steerY = this.tank.controls.getThrottle()
        let steerX = this.tank.controls.getSteer()

        let leftTruckThrottle = Utils.clamp(steerY - steerX, -1, 1) * this.perWheelPower
        let rightTruckThrottle = Utils.clamp(steerY + steerX, -1, 1) * this.perWheelPower

        for(let i = 0; i < this.axles; i++) {
            this.wheels[i * 2 + 1].throttle = leftTruckThrottle
            this.wheels[i * 2].throttle = rightTruckThrottle
        }
    }

    getLeftTrackDistance() {
        return this.wheels[0].distance
    }

    getRightTrackDistance() {
        return this.wheels[1].distance
    }
}