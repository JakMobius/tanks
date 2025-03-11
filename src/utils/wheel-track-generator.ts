import {WheelGroup, TankWheelGroupConfig, TankWheelConfig} from "src/entity/components/transmission/units/wheel-group";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";

export interface TrackConfig {
    x: number
    y: number

    /**
     * How much wheel rows are used to simulate this track
     */
    wheelRows?: number

    /**
     * How much wheel columns are used to simulate this track
     */
    wheelColumns?: number

    /**
     * The length of this track. Wheels will be evenly distributed
     * in this space
     */
    length: number

    /**
     * The width of this track. Wheels will be evenly distributed
     * in this space
     */
    width?: number

    /**
     * Maximum track surface friction (in newtons)
     */
    grip: number

    /**
     * The mass of this track (in kilograms)
     */
    mass: number

    /**
     * Maximum track brake force (in newtons)
     */
    maxBrakingTorque?: number

    /**
     * How much the track resists longitudinal movement (in newtons)
     */
    idleBrakingTorque?: number

    /**
     * @see TankWheelGroupConfig.lateralTensionLossPerMeter
     */
    lateralTensionLossPerMeter?: number

    /**
     * @see TankWheelGroupConfig.tensionLimit
     */
    wheelTensionLimit?: number,

    transmission?: TransmissionComponent
}

export default class WheelTruckGenerator {
    static generateWheels(config: TrackConfig): WheelGroup {
        const wheelRows = config.wheelRows ?? 3
        const wheelColumns = config.wheelColumns ?? 2
        const trackWidth = config.width ?? 0
        const trackLength = config.length
        const totalWheels = wheelRows * wheelColumns
        const wheelGrip = config.grip / totalWheels

        const startXPosition = config.x - trackLength / 2
        const startYPosition = config.y - trackWidth / 2

        const horizontalWheelSpacing = wheelRows > 1 ? trackLength / (wheelRows - 1) : 0
        const verticalWheelSpacing = wheelColumns > 1 ? trackWidth / (wheelColumns - 1) : 0

        let wheelsConfig: TankWheelConfig[] = []

        for (let x = 0; x < wheelRows; x++) {
            for (let y = 0; y < wheelColumns; y++) {
                wheelsConfig.push({
                    x: startXPosition + horizontalWheelSpacing * x,
                    y: startYPosition + verticalWheelSpacing * y,
                    grip: wheelGrip,
                    lateralTensionLossPerMeter: config.lateralTensionLossPerMeter,
                    tensionLimit: config.wheelTensionLimit
                })
            }
        }

        return new WheelGroup({
            wheels: wheelsConfig,
            momentum: config.mass,
            maxBrakingTorque: config.maxBrakingTorque,
            idleBrakingTorque: config.idleBrakingTorque,
        })
    }
}