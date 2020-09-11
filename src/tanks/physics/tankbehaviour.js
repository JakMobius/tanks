
const TankModel = require("../tankmodel")

/**
 * Class which defines the physical behaviour of each specific type of tank (tracked, wheeled, etc.)
 */
class TankBehaviour {

    /**
     * Physical model details. Used mostly for
     * rendering on client side.
     * @type Object
     */
    details = {};

    constructor(tank, config) {

        this.power = config.power || 10000
        this.lateralFriction = config.lateralFriction || 150
        this.frontalfriction = config.frontalfriction || 20
        this.angularFriction = config.angularFriction || 0.8

        /** @type TankModel */
        this.tank = tank
    }

    tick(dt) {
        const tank = this.tank
        const body = tank.body
        const velocity = body.GetLinearVelocity();

        const vx = velocity.x;
        const vy = velocity.y;

        let x2 = tank.matrix.cos * vx + tank.matrix.sin * vy;
        let y2 = -tank.matrix.sin * vx + tank.matrix.cos * vy;

        if(x2 > 0) {
            x2 -= this.lateralFriction * dt
            if(x2 < 0) x2 = 0
        } else if(x2 < 0) {
            x2 += this.lateralFriction * dt
            if(x2 > 0) x2 = 0
        }

        if(y2 > 0) {
            y2 -= this.frontalfriction * dt
            if(y2 < 0) y2 = 0
        } else if(y2 < 0) {
            y2 += this.frontalfriction * dt
            if(y2 > 0) y2 = 0
        }

        let angularVelocity = body.GetAngularVelocity()

        if(angularVelocity > 0) {
            angularVelocity -= this.angularFriction * dt
            if(angularVelocity < 0) angularVelocity = 0
        } else if(angularVelocity < 0) {
            angularVelocity += this.angularFriction * dt
            if(angularVelocity > 0) angularVelocity = 0
        }

        body.SetAngularVelocity(angularVelocity)

        velocity.x = tank.matrix.cos * x2 - tank.matrix.sin * y2
        velocity.y = tank.matrix.sin * x2 + tank.matrix.cos * y2

        body.SetLinearVelocity(velocity)
    }

    countDetails(dt) {}
}

module.exports = TankBehaviour