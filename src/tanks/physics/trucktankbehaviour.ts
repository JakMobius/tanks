import * as Box2D from '../../library/box2d';
import TankBehaviour, {TankBehaviourConfig} from './tankbehaviour';
import TankModel from "../tankmodel";

export interface TruckTankBehaviourConfig extends TankBehaviourConfig {
    truckbase?: number
    truckSlipperness?: number
    truckSlipperySpeed?: number
    [others: string]: any;
}

export interface TruckTankDetails {
    leftTrackSpeed: number
    rightTrackSpeed: number
    leftTrackDist: number
    rightTrackDist: number
    clutch: number
    transmissionSpeed: number
}

class TruckTankBehaviour extends TankBehaviour {
	public truckbase: any;
	public truckSlipperness: any;
	public truckSlipperySpeed: any;

	public details: TruckTankDetails = {
        leftTrackSpeed: 0,
        rightTrackSpeed: 0,
        leftTrackDist: 0,
        rightTrackDist: 0,
        clutch: 0,
        transmissionSpeed: 0
    }

    private preallocatedVector = new Box2D.Vec2()
    private preallocatedPoint = new Box2D.Vec2()

    constructor(tank: TankModel, config: TruckTankBehaviourConfig) {
        super(tank, config)

        this.truckbase = config.truckbase || 30
        this.truckSlipperness = config.truckSlipperness || 15
        this.truckSlipperySpeed = config.truckSlipperySpeed || 30
    }

    tick(dt: number) {
        super.tick(dt)
        const tank = this.tank
        const body = this.tank.body;

        let x = tank.controls.getSteer()
        let y = tank.controls.getThrottle()

        let leftTrackSpeed = Math.max(Math.min(y - x, 1), -1)
        let rightTrackSpeed = Math.max(Math.min(y + x, 1), -1)


        const ls = leftTrackSpeed * this.power;
        const rs = rightTrackSpeed * this.power;

        body.GetWorldVector(new Box2D.Vec2(0, ls), this.preallocatedVector)
        body.GetWorldPoint(new Box2D.Vec2(-this.truckbase, 0), this.preallocatedPoint)

        body.ApplyForce(this.preallocatedVector, this.preallocatedPoint)

        body.GetWorldVector(new Box2D.Vec2(0, rs), this.preallocatedVector)
        body.GetWorldPoint(new Box2D.Vec2(this.truckbase, 0), this.preallocatedPoint)

        body.ApplyForce(this.preallocatedVector, this.preallocatedPoint)
    }

    countDetails(dt: number) {
        const tank = this.tank
        const body = tank.body;

        const steerX = tank.controls.getSteer()
        const steerY = tank.controls.getThrottle()

        const velocity = body.GetLinearVelocity()
        const sx = velocity.x;
        const sy = velocity.y;

        const y2 = -tank.matrix.sin * sx + tank.matrix.cos * sy;

        const angularVelocity = body.GetAngularVelocity()
        let left = -y2 - angularVelocity * this.truckbase;
        let right = -y2 + angularVelocity * this.truckbase;

        const ls = Math.max(Math.min(steerY + steerX, 1), -1) * this.truckSlipperySpeed;
        const rs = Math.max(Math.min(steerY - steerX, 1), -1) * this.truckSlipperySpeed;

        if(this.truckSlipperness > Math.abs(left) && ls !== 0) {
            if(ls < 0) {
                left = Math.min(this.truckSlipperness, -ls)
            } else {
                left = -Math.min(this.truckSlipperness, ls)
            }
        }

        if(this.truckSlipperness > Math.abs(right) && rs !== 0) {
            if(rs < 0) {
                right = Math.min(this.truckSlipperness, -rs)
            } else {
                right = -Math.min(this.truckSlipperness, rs)
            }
        }

        this.details.leftTrackSpeed = left
        this.details.rightTrackSpeed = right
        this.details.leftTrackDist += left * dt
        this.details.rightTrackDist += right * dt

        this.details.clutch = Math.min(1, Math.abs(steerX) + Math.abs(steerY))
        this.details.transmissionSpeed = Math.max(Math.abs(this.details.leftTrackSpeed), Math.abs(this.details.rightTrackSpeed))
    }
}

export default TruckTankBehaviour;