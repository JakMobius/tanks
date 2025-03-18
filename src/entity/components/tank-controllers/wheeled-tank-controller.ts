import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import TankControls from "src/controls/tank-controls";
import TankEngineUnit, {EngineConfig} from "src/entity/components/transmission/units/tank-engine-unit";
import GearboxUnit, {GearboxUnitConfig} from "src/entity/components/transmission/units/gearbox-unit";
import {WheelGroup} from "src/entity/components/transmission/units/wheel-group";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import {GearConstraint} from "src/entity/components/transmission/constraints/gear-constraint";

export interface WheeledTankControllerConfig {
    /**
     * Minimal turning radius of the vehicle
     */
    minTurnRadius?: number

    /**
     * If the vehicle turns without the wheels sliding,
     * the perpendicular to the vehicle's longitudinal
     * axis, drawn through the center of rotation, will
     * pass through the point set by this value.
     */
    steerAnchorOffset?: number

    engineConfig: EngineConfig
    gearboxConfig: GearboxUnitConfig
    wheels: WheelGroup[]
}

export default class WheeledTankController extends EventHandlerComponent {

    engine: TankEngineUnit
    gearbox: GearboxUnit

    config: WheeledTankControllerConfig

    constructor(config?: WheeledTankControllerConfig) {
        super();

        this.eventHandler.on("physics-tick", (dt) => this.onTick(dt))
        this.eventHandler.on("death", () => this.engine.setEnabled(false))

        this.config = Object.assign({
            minTurnRadius: 5,
            steerAnchorOffset: 0
        }, config)
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);
        let wheelsComponent = this.entity.getComponent(TankWheelsComponent)
        let transmissionComponent = this.entity.getComponent(TransmissionComponent)

        this.engine = new TankEngineUnit(this.config.engineConfig)
        this.gearbox = new GearboxUnit(this.config.gearboxConfig)

        transmissionComponent.addUnit(this.engine)
        transmissionComponent.addUnit(this.gearbox)

        this.gearbox.attachToInputUnit(this.engine.unitIndex)

        wheelsComponent.setWheels(this.config.wheels)

        for (let wheel of wheelsComponent.getWheelGroups()) {
            transmissionComponent.addUnit(wheel)
        }
    }

    onDetach() {
        super.onDetach();
    }

    getTurnRadiusForSteerInput(steer: number) {
        if (steer === 0) return 0
        return 1 / steer * this.config.minTurnRadius
    }

    getSteerInputForTurnRadius(velocityTurnRadius: number) {
        if (velocityTurnRadius === 0) return 0
        return 1 / velocityTurnRadius * this.config.minTurnRadius
    }

    getCurrentTurnRadius() {
        const controlsComponent = this.entity.getComponent(TankControls)
        return this.getTurnRadiusForSteerInput(-controlsComponent.getSteer())
    }

    private getDriveSpeed() {
        const wheelsComponent = this.entity.getComponent(TankWheelsComponent)
        let result = 0;
        let wheels = 0;
        for (let wheelGroup of wheelsComponent.getWheelGroups()) {
            for (let wheel of wheelGroup.wheels) {
                result += wheel.groundSpeed;
            }
            wheels++;
        }
        if (wheels === 0) return 0;
        return result / wheels;
    }

    setBrake(brake: number) {
        const wheelsComponent = this.entity.getComponent(TankWheelsComponent)

        for (let wheel of wheelsComponent.getWheelGroups()) {
            wheel.setBrake(brake)
        }
    }

    onTick(dt: number) {
        const controlsComponent = this.entity.getComponent(TankControls)
        const wheelsComponent = this.entity.getComponent(TankWheelsComponent)

        // Update transmission controls

        const inputThrottle = controlsComponent.getThrottle()

        this.gearbox.setShouldReverse(inputThrottle < 0)

        const driveSpeed = this.getDriveSpeed();

        let applyThrottle = Math.abs(driveSpeed) < 2 || Math.sign(inputThrottle) == Math.sign(driveSpeed)
        let applyBrake = Math.sign(inputThrottle) * Math.sign(driveSpeed) === -1

        if(applyThrottle) applyBrake = false

        if (applyThrottle) {
            this.engine.setThrottle(Math.abs(inputThrottle))
        } else {
            this.engine.setThrottle(0)
        }

        if (applyBrake) {
            this.setBrake(1)
        } else {
            this.setBrake(0)
        }

        // Update turn radius

        const radius = this.getCurrentTurnRadius()

        for (let wheelGroup of wheelsComponent.getWheelGroups()) {
            for (let wheel of wheelGroup.wheels) {
                if (radius === 0) wheel.angle = 0
                else {
                    wheel.angle = Math.atan2(wheel.x - this.config.steerAnchorOffset, wheel.y - radius)
                    if (wheel.angle > Math.PI / 2) wheel.angle = -Math.PI + wheel.angle
                    if (wheel.angle < -Math.PI / 2) wheel.angle = Math.PI + wheel.angle
                }
            }
        }
    }
}