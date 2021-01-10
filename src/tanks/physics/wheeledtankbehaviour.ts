
import * as Box2D from '../../library/box2d';
import TankBehaviour, {TankBehaviourConfig, TankBehaviourDetails} from './tankbehaviour';
import TankModel from "../tankmodel";

interface WheeledTankDetails extends TankBehaviourDetails {
    leftWheelsAngle: number
    rightWheelsAngle: number
    leftWheelsSpeed: number
    rightWheelsSpeed: number
    leftWheelsDist: number
    rightWheelsDist: number
}

class WheeledTankModel extends TankBehaviour {
	public turnRate: any;
	public axleDistance: any;
	public axleWidth: any;
	public wheelSpeed: any;

	private preallocatedVector = new Box2D.Vec2()
    private preallocatedPoint = new Box2D.Vec2()

    public details: WheeledTankDetails = {
	    clutch: 0,
	    transmissionSpeed: 0,
        leftWheelsAngle: 0,
        rightWheelsAngle: 0,
        leftWheelsSpeed: 0,
        rightWheelsSpeed: 0,
        leftWheelsDist: 0,
        rightWheelsDist: 0
    }

    constructor(tank: TankModel, config: TankBehaviourConfig) {
        super(tank, config)

        this.turnRate = 2
        this.axleDistance = 0.6
        this.axleWidth = 0.8
        this.wheelSpeed = 9.8
    }

    tick(dt: number) {
        super.tick(dt)
        const tank = this.tank
        const body = tank.body

        let steerX, steerY;

        steerX = tank.controls.getSteer()
        steerY = tank.controls.getThrottle()

        const throttle = this.power *  steerY
        const k = 20000

        const velocity = body.GetLinearVelocity();
        const angular = body.GetAngularVelocity();

        const vx = velocity.x;
        const vy = velocity.y;

        const y2 = -tank.matrix.sin * vx + tank.matrix.cos * vy;
        const turnRate = (y2 * steerX * this.turnRate - angular) * k / (Math.abs(y2) / 15 + 1)

        body.GetWorldVector(new Box2D.Vec2(0, throttle), this.preallocatedVector)
        body.GetWorldPoint(new Box2D.Vec2(0, 0), this.preallocatedPoint)

        body.ApplyForce(this.preallocatedVector, this.preallocatedPoint)
        body.ApplyTorque(turnRate)
    }

    countDetails(dt: number) {
        let tank = this.tank
        let body = tank.body
        let steer = tank.controls.getSteer()

        if (steer === 0) {
            this.details.leftWheelsAngle = 0
            this.details.rightWheelsAngle = 0
        } else {
            let radius = 1 / steer * 2

            this.details.leftWheelsAngle = Math.atan2(this.axleDistance, radius + this.axleWidth / 2)
            this.details.rightWheelsAngle = Math.atan2(this.axleDistance, radius - this.axleWidth / 2)

            if (steer < 0) {
                this.details.rightWheelsAngle += Math.PI
                this.details.leftWheelsAngle += Math.PI
            }
        }

        let speed = tank.body.GetLinearVelocity()

        let y2 = -tank.matrix.sin * speed.x + tank.matrix.cos * speed.y
        let angularVelocity = body.GetAngularVelocity()

        let left = (y2 + angularVelocity * this.axleWidth / 2) * this.wheelSpeed
        let right = (y2 - angularVelocity * this.axleWidth / 2) * this.wheelSpeed

        this.details.leftWheelsSpeed = left * dt
        this.details.rightWheelsSpeed = right * dt
        this.details.leftWheelsDist -= left * dt
        this.details.rightWheelsDist -= right * dt
    }
}

export default WheeledTankModel;