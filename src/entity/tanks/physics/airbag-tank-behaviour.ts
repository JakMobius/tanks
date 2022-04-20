import * as Box2D from '../../../library/box2d';
import TankBehaviour from './tank-behaviour';
import TankModel from "../tank-model";
import PhysicalComponent from "../../components/physics-component";

interface AirbagBehaviourConfig {
    power: number
    torque: number
    maxPropellerSpeed?: number
}

export default class AirbagTankModel extends TankBehaviour {
    public power: number
	public torque: number
    public maxPropellerSpeed: number
	public propellerSpeed: number = 0
	public propellerDist: number = 0

    constructor(tank: TankModel, config: AirbagBehaviourConfig) {
        super(tank)

        this.power = config.power
        this.torque = config.torque
        this.maxPropellerSpeed = config.maxPropellerSpeed || 40
    }

    tick(dt: number) {
        super.tick(dt)

        const body = this.entity.getComponent(PhysicalComponent).getBody();

        const throttleInput = this.controlsComponent.getThrottle()

        const throttle = this.power * throttleInput;
        const rotation = this.torque * this.controlsComponent.getSteer() * this.controlsComponent.getThrottle();

        body.GetWorldVector(new Box2D.Vec2(0, throttle), this.localVector1)
        body.GetWorldPoint(new Box2D.Vec2(0, 0), this.localVector2)

        body.ApplyForce(this.localVector1, this.localVector2)
        body.ApplyTorque(rotation)

        this.propellerSpeed = (Math.abs(throttleInput) + 0.5) * this.maxPropellerSpeed;
        this.propellerDist += this.propellerSpeed * dt
    }
}