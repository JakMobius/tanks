import * as Box2D from '../../../library/box2d';
import TankBehaviour from './tank-behaviour';
import TankModel from "../tank-model";

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
        const body = this.tank.getBody();

        const throttleInput = this.tank.controls.getThrottle()

        const throttle = this.power * throttleInput;
        const rotation = this.torque * this.tank.controls.getSteer() * this.tank.controls.getThrottle();

        body.GetWorldVector(new Box2D.Vec2(0, throttle), this.localVector1)
        body.GetWorldPoint(new Box2D.Vec2(0, 0), this.localVector2)

        body.ApplyForce(this.localVector1, this.localVector2)
        body.ApplyTorque(rotation)

        this.propellerSpeed = (Math.abs(throttleInput) + 0.5) * this.maxPropellerSpeed;
        this.propellerDist += this.propellerSpeed * dt
    }
}