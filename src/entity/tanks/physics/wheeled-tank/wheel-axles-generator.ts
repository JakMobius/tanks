
import {TankWheel, TankWheelConfig} from "./wheel";

export interface WheelAxlesConfig {
    /**
     * Amount of wheel axles (single axle holds two wheels)
     */
    axles?: number,

    // MARK: Axle positions

    /**
     * Distance between axles. This value will be used
     * if axleOffsets field is omitted.
     */

    axleDistance?: number,

    /**
     * The distance between wheels on each axle
     */

    axleWidth?: number,

    /**
     * The vertical offset of each axle. This value will be used
     * if axleOffsets field is omitted
     */
    axlesOffset?: number

    /**
     * The offset of the axes in the longitudinal
     * axis of the vehicle relative to its center
     */
    axleOffsets?: number[]

    /**
     * The default wheel config
     */
    wheelConfig?: Omit<TankWheelConfig, 'x' | 'y'>

    /**
     * Array of wheel configurations for each axle
     */
    axleWheelConfigs?: Omit<TankWheelConfig, 'x' | 'y'>[]
}

export default class WheelAxlesGenerator {
    private static defaultAxleOffsets(axles: number, axlesOffset: number, distanceBetweenAxles: number) {
        let result = [];
        let axleY = -distanceBetweenAxles * (axles - 1) / 2 + axlesOffset
        for(let axle = 0; axle < axles; axle++) {
            result.push(axleY)
            axleY += distanceBetweenAxles
        }
        return result
    }

    static generateWheels(config: WheelAxlesConfig): TankWheel[] {
        const axleCount = config.axles || 3
        const axlesOffset = config.axlesOffset || 0
        const distanceBetweenAxles = config.axleDistance || 6
        const axleWidth = config.axleWidth || 8
        const axleOffsetList = config.axleOffsets || this.defaultAxleOffsets(axleCount, axlesOffset, distanceBetweenAxles)

        let wheels: TankWheel[] = []

        for(let i = 0; i < axleCount; i++) {
            let axleOffset = axleOffsetList[i]

            let leftWheelConfig: Partial<TankWheelConfig> = {}

            if(config.wheelConfig) {
                Object.assign(leftWheelConfig, config.wheelConfig)
            }

            if(config.axleWheelConfigs && config.axleWheelConfigs[i]) {
                Object.assign(leftWheelConfig, config.axleWheelConfigs[i])
            }

            let rightWheelConfig = Object.assign({}, leftWheelConfig)

            const leftWheel = new TankWheel(Object.assign(leftWheelConfig, {
                x: -axleWidth,
                y: axleOffset
            }))

            const rightWheel = new TankWheel(Object.assign(rightWheelConfig, {
                x: axleWidth,
                y: axleOffset
            }))

            wheels.push(leftWheel, rightWheel)
        }

        return wheels
    }
}