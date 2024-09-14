import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Axle from "src/controls/axle";
import Entity from "src/utils/ecs/entity";
import TankControls from "src/controls/tank-controls";
import PhysicalComponent from "src/entity/components/physics-component";
import {clamp} from "src/utils/utils";
import * as Box2D from "src/library/box2d"
import DebugDrawer from "src/client/graphics/drawers/debug-drawer/debug-drawer";

export interface WheeledSteeringAssistantConfig {

    /**
     * How much should the wheels be turned in the opposite direction
     * when the vehicle is drifting
     */
    lateralMovementSteerRate?: number

    /**
     * Amount of counter-steer applied when the vehicle is about to turn around.
     * Might cause wobbling
     */
    angularVelocityCounterSteer?: number

    /**
     * Speed that reaches maximum steering limit of steerLimitFactor
     */
    steerLimitSpeed?: number

    /**
     * How much the assistant will restrict the steering at maximum speed
     * of steerLimitSpeed.
     */
    steerLimitFactor?: number
    criticalDriftAngle?: number
}

export default class WheeledSteeringAssistant extends EventHandlerComponent {

    tractionSteerAxle = new Axle()
    lateralMovementSteerRate: number
    angularVelocityCounterSteer: number
    steerLimitSpeed: number
    steerLimitFactor: number
    criticalDriftAngle: number

    private angularVelocity = 0
    private velocityVector = new Box2D.Vec2()
    private velocity = 0
    private oldVelocityAngles = Array(8).fill(0)
    private distanceToCriticalAngle = 0
    private currentDriftAngle = 0
    private velocityAngle = 0
    private rollingBackwards = false
    private userSteer = 0

    constructor(config?: WheeledSteeringAssistantConfig) {
        super();

        config = Object.assign({
            lateralMovementSteerRate: 0.5,
            angularVelocityCounterSteer: 0.05,
            steerLimitFactor: 0.95,
            steerLimitSpeed: 20,
            straightenFactor: 0.3,
            criticalDriftAngle: 0.7
        }, config)

        // this.straightenFactor = config.straightenFactor
        this.lateralMovementSteerRate = config.lateralMovementSteerRate
        this.angularVelocityCounterSteer = config.angularVelocityCounterSteer
        this.steerLimitFactor = config.steerLimitFactor
        this.steerLimitSpeed = config.steerLimitSpeed
        this.criticalDriftAngle = config.criticalDriftAngle

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

    private normalizeAngle(angle: number) {
        angle %= Math.PI * 2
        angle += Math.PI * 3
        angle %= Math.PI * 2
        angle -= Math.PI
        return angle
    }

    private refreshConstants() {
        const controls = this.entity.getComponent(TankControls)
        const steer = controls.axles.get("x").getValue()
        this.userSteer = steer - this.tractionSteerAxle.ownValue

        const body = this.entity.getComponent(PhysicalComponent).body
        const velocityVector = body.GetLinearVelocity();
        this.angularVelocity = body.GetAngularVelocity()

        this.velocityVector.x = velocityVector.x;
        this.velocityVector.y = velocityVector.y;

        this.velocity = this.velocityVector.Length()

        this.currentDriftAngle = 0
        this.distanceToCriticalAngle = 1
        this.rollingBackwards = false

        if (this.velocity > 0.1) {
            this.velocityAngle = Math.atan2(this.velocityVector.y, this.velocityVector.x) - Math.PI / 2
            let velocityAngleDiff = this.velocityAngle - body.GetAngle()
            velocityAngleDiff = this.normalizeAngle(velocityAngleDiff)

            this.rollingBackwards = Math.abs(velocityAngleDiff) > Math.PI / 2

            if (!this.rollingBackwards) {
                this.currentDriftAngle = velocityAngleDiff
                this.distanceToCriticalAngle = clamp(this.currentDriftAngle / this.criticalDriftAngle, -1, 1)
                this.distanceToCriticalAngle = 1 - Math.abs(this.distanceToCriticalAngle)
            }
        }

        this.oldVelocityAngles.push(this.velocityAngle)
        this.oldVelocityAngles.shift()
    }

    private getLateralMovementCounterSteer() {
        let factor = clamp((this.velocity - 2) / 2, 0, 1)
        let velocityAngleDiff = this.currentDriftAngle
        velocityAngleDiff /= (Math.PI / 2)
        velocityAngleDiff *= Math.min(1, this.velocity * 0.1)
        return velocityAngleDiff * this.lateralMovementSteerRate * factor
    }

    private getAngularVelocityCounterSteer(dt: number) {
        if (this.rollingBackwards) {
            return 0
        }

        let factor = clamp((this.velocity - 1) / 1, 0, 1)
        factor *= Math.max((1 - this.distanceToCriticalAngle), (1 - Math.abs(this.userSteer)))
        const steerRate = this.angularVelocityCounterSteer * factor

        // DebugDrawer.instance.plotData.plot(0xFFFF0000, perfectAngularVelocity / 2 * steerRate, Date.now() / 1000)

        return -this.angularVelocity * steerRate
    }

    // private getStraightenCounterSteer() {
    //     if (this.rollingBackwards) {
    //         return 0
    //     }
    //
    //     const controller = this.entity.getComponent(WheeledTankController)
    //     const currentTurnRadius = controller.getTurnRadiusForSteerInput(this.userSteer)
    //
    //     let perfectAngularVelocity = 0
    //     if (currentTurnRadius !== 0) {
    //         perfectAngularVelocity = this.velocity / currentTurnRadius
    //     }
    //
    //     const steerRate = this.straightenFactor * 4
    //     const result = -(this.angularVelocity - perfectAngularVelocity) * steerRate
    //
    //     return 0;
    // }

    private getSteerLimit() {
        const steerLimitFactor = Math.min(1, this.velocity / this.steerLimitSpeed) * this.steerLimitFactor
        return -this.userSteer * steerLimitFactor
    }

    private getDriftSteerLimit() {

        // DebugDrawer.instance.plotData.plot(0xFFFF0000, (this.currentDriftAngle + derivative * 0) / 2, Date.now() / 1000)
        // DebugDrawer.instance.plotData.plot(0xFF000FF0, this.criticalDriftAngle / 2, Date.now() / 1000)
        // DebugDrawer.instance.plotData.plot(0xFF000FE0, -this.criticalDriftAngle / 2, Date.now() / 1000)
        // DebugDrawer.instance.plotData.plot(0x99FFFF00, this.currentDriftAngle / 2, Date.now() / 1000)
    }

    private onTick(dt: number) {
        let newSteerValue = 0

        this.refreshConstants();
        newSteerValue += this.getSteerLimit()
        newSteerValue += this.getLateralMovementCounterSteer()
        newSteerValue += this.getAngularVelocityCounterSteer(dt)
        this.getDriftSteerLimit()

        // DebugDrawer.instance.plotData.plot(0xFFFF0066, newSteerValue / 2, Date.now() / 1000)

        this.tractionSteerAxle.setValue(newSteerValue)
    }
}