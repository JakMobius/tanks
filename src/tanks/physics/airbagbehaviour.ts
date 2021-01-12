import * as Box2D from '../../library/box2d';
import TankBehaviour, {TankBehaviourConfig, TankBehaviourDetails} from './tankbehaviour';
import TankModel from "../tankmodel";

interface AirbagBehaviourDetails extends TankBehaviourDetails {
    propellerDist: number,
}

interface AirbagBehaviourConfig extends TankBehaviourConfig {
    torque?: number
    friction?: number
    propellerSpeed?: number
}

class AirbagTankModel extends TankBehaviour {
	public torque: any;
	public friction: any;
	public propellerSpeed: any;

	public details: AirbagBehaviourDetails = {
        transmissionSpeed: 0,
        propellerDist: 0,
        clutch: 0
    }

    private preallocatedVector = new Box2D.Vec2()
    private preallocatedPoint = new Box2D.Vec2()

    constructor(tank: TankModel, config: AirbagBehaviourConfig) {
        super(tank, config)

        this.power = config.power || 50000
        this.torque = config.torque || 120000
        this.friction = config.friction || 0.1
        this.propellerSpeed = config.propellerSpeed || 40
    }

    tick(dt: number) {
        const body = this.tank.body;

        const velocity = body.m_linearVelocity;

        const x = velocity.x;
        const y = velocity.y;

        const initialSpeed = Math.sqrt(x ** 2 + y ** 2);
        let newSpeed = initialSpeed;

        newSpeed -= this.friction * dt

        if(newSpeed < 0) newSpeed = 0

        let coefficient;

        if(initialSpeed > 0) coefficient = newSpeed / initialSpeed
        else coefficient = 1

        velocity.x = x * coefficient
        velocity.y = y * coefficient

        const throttle = this.power * this.tank.controls.getThrottle();
        const rotation = this.torque * this.tank.controls.getSteer() * this.tank.controls.getThrottle();

        body.GetWorldVector(new Box2D.Vec2(0, throttle), this.preallocatedVector)
        body.GetWorldPoint(new Box2D.Vec2(0, 0), this.preallocatedPoint)

        body.ApplyForce(this.preallocatedVector, this.preallocatedPoint)
        body.ApplyTorque(rotation)
    }

    countDetails(dt: number) {
        const tank = this.tank
        const speed = (Math.abs(tank.controls.getThrottle()) + 0.5) * this.propellerSpeed;

        if(tank.health > 0) {
            this.details.propellerDist += speed * dt
            this.details.transmissionSpeed = (speed * dt) / 2 + 0.3
        } else {
            this.details.transmissionSpeed = 0
        }

        this.details.clutch = Math.abs(tank.controls.getThrottle())
    }
}

export default AirbagTankModel;