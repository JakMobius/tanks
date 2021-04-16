import * as Box2D from '../../library/box2d';
import TankBehaviour, {TankBehaviourConfig, TankBehaviourDetails} from './tankbehaviour';
import TankModel from "../tankmodel";
import Utils from "../../utils/utils";

export interface TruckTankBehaviourConfig extends TankBehaviourConfig {
    truckbase?: number
    truckSlipperness?: number
    truckSlipperySpeed?: number
    truckMaxSpeed?: number
    [others: string]: any;
}

export interface TruckTankDetails extends TankBehaviourDetails {
    leftTrackSpeed: number
    rightTrackSpeed: number
    leftTrackDist: number
    rightTrackDist: number
}

class TruckTankBehaviour extends TankBehaviour {
	public truckbase: number;
	public truckSlipperness: number;
	public truckSlipperySpeed: number;

	public details: TruckTankDetails = {
        leftTrackSpeed: 0,
        rightTrackSpeed: 0,
        leftTrackDist: 0,
        rightTrackDist: 0,
        clutch: 0,
        transmissionSpeed: 0
    }

    private preallocatedPoint = new Box2D.Vec2()

    constructor(tank: TankModel, config: TruckTankBehaviourConfig) {
        super(tank, config)

        this.truckbase = config.truckbase || 10
        this.truckSlipperness = config.truckSlipperness || 15
        this.truckSlipperySpeed = config.truckSlipperySpeed || 30
    }

    tick(dt: number) {
        super.tick(dt)
        const tank = this.tank
        const body = this.tank.body;

        let x = tank.controls.getSteer()
        let y = tank.controls.getThrottle()

        let perfectLeftTrackSpeed = Math.max(Math.min(y - x, 1), -1)
        let perfectRightTrackSpeed = Math.max(Math.min(y + x, 1), -1)

        // let perfectLeftTrackSpeed = Math.max(Math.min(y - x, 1), -1) * this.truckMaxSpeed
        // let perfectRightTrackSpeed = Math.max(Math.min(y + x, 1), -1) * this.truckMaxSpeed

        // const velocity = body.GetLinearVelocity()
        // const tankForwardVelocity = -tank.matrix.sin * velocity.x + tank.matrix.cos * velocity.y;
        // const angularVelocity = body.GetAngularVelocity()
        //
        // let currentLeftTrackSpeed = tankForwardVelocity - angularVelocity * this.truckbase;
        // let currentRightTrackSpeed = tankForwardVelocity + angularVelocity * this.truckbase;

        // let gradient = 50
        //
        // let diffLeftSpeed = Utils.clamp(perfectLeftTrackSpeed - currentLeftTrackSpeed, -gradient, gradient) / gradient
        // let diffRightSpeed = Utils.clamp(perfectRightTrackSpeed - currentRightTrackSpeed, -gradient, gradient) / gradient

        const ls = perfectLeftTrackSpeed * this.power;
        const rs = perfectRightTrackSpeed * this.power;

        body.GetWorldVector(new Box2D.Vec2(0, ls), this.localVector1)
        body.GetWorldPoint(new Box2D.Vec2(-this.truckbase, 0), this.preallocatedPoint)

        body.ApplyForce(this.localVector1, this.preallocatedPoint)

        body.GetWorldVector(new Box2D.Vec2(0, rs), this.localVector1)
        body.GetWorldPoint(new Box2D.Vec2(this.truckbase, 0), this.preallocatedPoint)

        body.ApplyForce(this.localVector1, this.preallocatedPoint)
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