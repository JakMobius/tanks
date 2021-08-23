import {TankWheel, TankWheelConfig} from "../wheeled-tank/wheel";

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
     * @see TankWheelConfig.lateralTensionLossPerMeter
     */
    lateralTensionLossPerMeter?: number

    /**
     * @see TankWheelConfig.tensionLimit
     */
    wheelTensionLimit?: number
}

export default class WheelTruckGenerator {
    static generateWheels(config: TrackConfig): TankWheel[] {
        const wheelRows = config.wheelRows ?? 3
        const wheelColumns = config.wheelColumns ?? 2
        const tensionLimit = config.wheelTensionLimit ?? 0.02
        const tensionLossPerMeter = config.lateralTensionLossPerMeter ?? 0.01
        const trackWidth = config.width ?? 0
        const trackLength = config.length

        const totalWheels = wheelRows * wheelColumns

        const wheelGrip = config.grip / totalWheels
        const wheelMass = config.mass / totalWheels
        const maxWheelBrakeTorque = (config.maxBrakingTorque ?? 1000) / totalWheels
        const idleWheelBrakeTorque = (config.idleBrakingTorque ?? 50) / totalWheels

        const startXPosition = config.x - trackWidth / 2
        const startYPosition = config.y - trackLength / 2

        const horizontalWheelSpacing = wheelColumns > 1 ? trackWidth / (wheelColumns - 1) : 0
        const verticalWheelSpacing = wheelRows > 1 ? trackLength / (wheelRows - 1) : 0

        let wheels: TankWheel[] = []

        for(let y = 0; y < wheelRows; y++) {
            for(let x = 0; x < wheelColumns; x++) {
                wheels.push(new TankWheel({
                    x: startXPosition + horizontalWheelSpacing * x,
                    y: startYPosition + verticalWheelSpacing * y,
                    grip: wheelGrip,
                    mass: wheelMass,
                    isDriving: true,
                    maxBrakingTorque: maxWheelBrakeTorque,
                    idleBrakingTorque: idleWheelBrakeTorque,
                    lateralTensionLossPerMeter: tensionLossPerMeter,
                    tensionLimit: tensionLimit
                }))
            }
        }

        return wheels
    }
}