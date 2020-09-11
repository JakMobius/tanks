
const Box2D = require("../../library/box2d")
const TankBehaviour = require("./tankbehaviour.js")

class WheeledTankModel extends TankBehaviour {
    constructor(tank, config) {
        super(tank, config)

        this.turnRate = 2
        this.axleDistance = 0.6
        this.axleWidth = 0.8
        this.wheelSpeed = 9.8

        this.details = {
            leftWheelsAngle: 0,
            rightWheelsAngle: 0,
            leftWheelsSpeed: 0,
            rightWheelsSpeed: 0,
            leftWheelsDist: 0,
            rightWheelsDist: 0
        }
    }

    clone() {
        return new WheeledTankModel(this)
    }

    tick(dt) {
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

        body.ApplyForce(body.GetWorldVector(new Box2D.b2Vec2(0, throttle)), body.GetWorldPoint(new Box2D.b2Vec2(0, 0)))
        body.ApplyTorque(turnRate)
    }

    countDetails(dt) {
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

module.exports = WheeledTankModel