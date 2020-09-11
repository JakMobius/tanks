const Box2D = require("../../library/box2d");
const TankBehaviour = require("./tankbehaviour.js")

class AirbagTankModel extends TankBehaviour {
    constructor(tank, config) {
        super(tank, config)

        this.power = config.power || 50000
        this.torque = config.torque || 120000
        this.friction = config.friction || 0.1
        this.propellerSpeed = config.propellerSpeed || 40

        this.details = {
            transmissionSpeed: 0,
            propellerDist: 0,
            clutch: 0
        }
    }

    tick(dt) {
        const body = this.tank.body;

        const velocity = body.GetLinearVelocity();

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

        body.ApplyForce(body.GetWorldVector(new Box2D.b2Vec2(0, throttle)), body.GetWorldPoint(new Box2D.b2Vec2(0, 0)))
        body.ApplyTorque(rotation)
    }

    countDetails(dt) {
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

module.exports = AirbagTankModel