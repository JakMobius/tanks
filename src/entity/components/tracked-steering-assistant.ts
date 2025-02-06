import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Axle from "src/controls/axle";
import Entity from "src/utils/ecs/entity";
import TankControls from "src/controls/tank-controls";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import PhysicalComponent from "src/entity/components/physics-component";

export interface TrackedSteeringAssistantConfig {
    trackSpeedCorrectionStrength?: number
    angularDampingStrength?: number
    velocityDirectionFactor?: number
    outputDamping?: number
    maxRadPerSecond?: number
}

export default class TrackedSteeringAssistant extends EventHandlerComponent {

    tractionSteerAxle = new Axle()

    private trackSpeedCorrectionStrength: number
    private angularDampingStrength: number
    private velocityDirectionFactor: number
    private maxRadPerSecond: number
    private outputDamping: number
    private motionCoefficient: number

    private userSteer = 0.0
    private leftTrackSpeed: number = 0.0
    private rightTrackSpeed: number = 0.0
    private maxAbsTrackSpeed: number = 0.0
    private direction: number = 0.0

    constructor(config?: TrackedSteeringAssistantConfig) {
        super();

        config = Object.assign({
            trackSpeedCorrectionStrength: 0.1,
            angularDampingStrength: 1.5,
            velocityDirectionFactor: 0.4,
            maxRadPerSecond: 6.5,
            outputDamping: 100,
        }, config)

        this.trackSpeedCorrectionStrength = config.trackSpeedCorrectionStrength
        this.angularDampingStrength = config.angularDampingStrength
        this.velocityDirectionFactor = config.velocityDirectionFactor
        this.maxRadPerSecond = config.maxRadPerSecond
        this.outputDamping = config.outputDamping

        this.eventHandler.on("physics-tick", (dt: number) => this.onTick(dt))
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);
        entity.getComponent(TankControls).axles.get("x").addSource(this.tractionSteerAxle)
    }

    onDetach() {
        super.onDetach();
        this.tractionSteerAxle.disconnectAll()
    }

    private refreshConstants() {
        const behaviour = this.entity.getComponent(TrackedTankController)
        this.leftTrackSpeed = behaviour.getLeftTrackSpeed()
        this.rightTrackSpeed = behaviour.getRightTrackSpeed()

        this.maxAbsTrackSpeed = Math.max(Math.abs(this.leftTrackSpeed) + Math.abs(this.rightTrackSpeed))
        this.motionCoefficient = 1 / (this.maxAbsTrackSpeed * this.velocityDirectionFactor + 1)

        this.direction = Math.sign(this.leftTrackSpeed + this.rightTrackSpeed)

        const controls = this.entity.getComponent(TankControls)
        const steer = controls.axles.get("x").getValue()
        this.userSteer = steer - this.tractionSteerAxle.ownValue
    }

    private getCorrectionSteer() {
        if (this.maxAbsTrackSpeed < 0.1) return 0

        let actualSteer = this.leftTrackSpeed - this.rightTrackSpeed
        return (this.userSteer * this.direction - actualSteer) * this.motionCoefficient * this.trackSpeedCorrectionStrength
    }

    private getAngularDamping() {
        let body = this.entity.getComponent(PhysicalComponent).body
        let angularVelocity = this.userSteer * this.maxRadPerSecond * this.direction * this.motionCoefficient - body.GetAngularVelocity()

        return angularVelocity * this.angularDampingStrength * this.direction
    }

    private onTick(dt: number) {
        let newSteerValue = 0

        this.refreshConstants()
        // newSteerValue += this.getCorrectionSteer()
        newSteerValue += this.getAngularDamping()

        let dampingCoefficient = Math.exp(-dt * this.outputDamping)

        newSteerValue = this.tractionSteerAxle.ownValue * dampingCoefficient + newSteerValue * (1 - dampingCoefficient)

        // DebugDrawer.instance.plotData.plot(0xFF00FFFF, newSteerValue, Date.now() / 1000)

        this.tractionSteerAxle.setValue(newSteerValue)
    }
}