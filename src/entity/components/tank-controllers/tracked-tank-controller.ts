import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import {clamp, nonStrictSignComparator} from "src/utils/utils";
import WheelTruckGenerator, {TrackConfig} from "src/utils/wheel-track-generator";
import {WheelGroup} from "src/entity/components/transmission/units/wheel-group";
import TankControls from "src/controls/tank-controls";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import TankEngineUnit, {EngineConfig} from "src/entity/components/transmission/units/tank-engine-unit";
import GearboxUnit, {GearboxUnitConfig} from "src/entity/components/transmission/units/gearbox-unit";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import {GearConstraint} from "src/entity/components/transmission/constraints/gear-constraint";
import DifferentialConstraint from "src/entity/components/transmission/constraints/differential-constraint";
import BrakeConstraint from "src/entity/components/transmission/constraints/brake-constraint";

export type TrackedTankControllerConfig = {
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
    trackConfig: Omit<TrackConfig, 'x' | 'y'>,

    engineConfig: EngineConfig,
    gearboxConfig: GearboxUnitConfig
}

export default class TrackedTankController extends EventHandlerComponent {

    private leftTrackWheels: WheelGroup
    private rightTrackWheels: WheelGroup
    private config: TrackedTankControllerConfig

    engine: TankEngineUnit
    gearbox: GearboxUnit

    constructor(config: TrackedTankControllerConfig) {
        super()

        this.config = config

        this.eventHandler.on("death", () => this.engine.setEnabled(false))
        this.eventHandler.on('physics-tick', () => this.onTick())
    }

    createWheels() {
        const leftTrackConfig = Object.assign({}, this.config.trackConfig)
        const rightTrackConfig = Object.assign({}, this.config.trackConfig)

        const trackOffset = this.config.trackOffset ?? 0

        const leftTrackWheels = WheelTruckGenerator.generateWheels(Object.assign(leftTrackConfig, {
            x: trackOffset,
            y: -this.config.trackGauge / 2
        }))

        const rightTrackWheels = WheelTruckGenerator.generateWheels(Object.assign(rightTrackConfig, {
            x: trackOffset,
            y: this.config.trackGauge / 2,
        }))

        this.leftTrackWheels = leftTrackWheels
        this.rightTrackWheels = rightTrackWheels

        this.setWheels()
    }

    createTransmission() {
        let transmission = this.entity.getComponent(TransmissionComponent)

        this.engine = new TankEngineUnit(this.config.engineConfig)
        this.gearbox = new GearboxUnit(this.config.gearboxConfig)

        transmission.addUnit(this.engine)
        transmission.addUnit(this.gearbox)

        transmission.addUnit(this.leftTrackWheels)
        transmission.addUnit(this.rightTrackWheels)

        this.gearbox.attachToInputUnit(this.engine.unitIndex)

        transmission.system.addConstraint(new DifferentialConstraint(
            this.gearbox.outputUnitIndex,
            this.leftTrackWheels.unitIndex,
            this.rightTrackWheels.unitIndex))
    }

    getLeftTrackSpeed() {
        const transmissionComponent = this.entity.getComponent(TransmissionComponent)
        return transmissionComponent.system.qdot[this.leftTrackWheels.unitIndex]
    }

    getRightTrackSpeed() {
        const transmissionComponent = this.entity.getComponent(TransmissionComponent)
        return transmissionComponent.system.qdot[this.rightTrackWheels.unitIndex]
    }

    /**
     * Counts approximate velocity of the most static point of the track
     * @param wheelGroup
     */
    getTrackGroundSpeed(wheelGroup: WheelGroup) {
        let positiveSpeed = Infinity
        let negativeSpeed = -Infinity

        for (let wheel of wheelGroup.wheels) {
            if (wheel.groundSpeed < 0) negativeSpeed = Math.max(negativeSpeed, wheel.groundSpeed)
            else positiveSpeed = Math.min(positiveSpeed, wheel.groundSpeed)
        }

        if (isFinite(positiveSpeed)) {
            if (isFinite(negativeSpeed)) {
                return 0
            }
            return positiveSpeed
        }

        if (isFinite(negativeSpeed)) {
            return negativeSpeed
        }
        return 0
    }


    protected updateWheelThrottle() {
        const controlsComponent = this.entity.getComponent(TankControls)
        const steer = -controlsComponent.getSteer()

        this.leftTrackWheels.setBrake(Math.max(0, Math.min(1, -steer)))
        this.rightTrackWheels.setBrake(Math.max(0, Math.min(1, steer)))
    }

    getLeftTrackDistance() {
        return this.leftTrackWheels.getDistance()
    }

    getRightTrackDistance() {
        return this.rightTrackWheels.getDistance()
    }

    private onTick() {
        const controlsComponent = this.entity.getComponent(TankControls)
        this.updateWheelThrottle()

        this.engine.setThrottle(Math.abs(controlsComponent.getThrottle()))
        this.gearbox.setShouldReverse(controlsComponent.getThrottle() < 0)
    }

    private setWheels() {
        if (!this.entity) {
            return
        }

        const wheelsComponent = this.entity.getComponent(TankWheelsComponent)
        const transmissionComponent = this.entity.getComponent(TransmissionComponent)

        if (!wheelsComponent || !transmissionComponent) {
            return
        }

        wheelsComponent.setWheels([
            this.leftTrackWheels,
            this.rightTrackWheels
        ])
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);
        this.createWheels()
        this.setWheels()
        this.createTransmission()
    }
}