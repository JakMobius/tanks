
const Box2D = require("../library/box2d")
const Matrix3 = require("./graphics/matrix3")

class Camera {

    /**
     * @type {Matrix3}
     */
    matrix = null

    /**
     * Enable inertial camera movement.
     * @type {boolean}
     */
    inertial = false

    /**
     * Camera position (exclude camera shaking)
     * @type {b2Vec2}
     */
    position = null

    /**
     * Camera position delta
     * @type {b2Vec2}
     */
    shaking = null

    /**
     * Camera shaking velocity
     * @type {b2Vec2}
     */
    shakeVelocity = null

    /**
     * @type {b2Vec2}
     */
    target = null

    constructor(options) {
        options = Object.assign({
            baseScale: 1,
            target: null,
            limit: true,
            inertial: false
        }, options)

        this.baseScale = options.baseScale
        this.target = options.target
        this.viewport = options.viewport
        this.defaultPosition = options.defaultPosition

        this.position = null

        this.velocity = new Box2D.b2Vec2()
        this.shaking = new Box2D.b2Vec2()
        this.shakeVelocity = new Box2D.b2Vec2()
        this.realTarget = new Box2D.b2Vec2()
        this.targetVelocity = null

        this.limit = options.limit
        this.viewportLimit = null

        if(this.limit) {
            this.viewportLimit = options.viewportLimit || new Box2D.b2Vec2(1440, 900)
        }

        this.matrix = new Matrix3()
        this.inertial = options.inertial
    }

    reset() {
        if(this.position) {
            this.position.x = this.defaultPosition.x
            this.position.y = this.defaultPosition.y
        } else {
            this.position = this.defaultPosition.Copy()
        }
        this.shaking.x = 0
        this.shaking.y = 0
        this.shakeVelocity.x = 0
        this.shakeVelocity.y = 0
    }

    getPosition() {
        return new Box2D.b2Vec2(this.position.x + this.shaking.x, this.position.y + this.shaking.y)
    }

    targetPosition(position, velocity, target, lookahead, dt) {
        let lookAheadX = position.x + velocity.x * lookahead
        let lookAheadY = position.y + velocity.y * lookahead

        if(target == null) {
            velocity.x -= lookAheadX * dt
            velocity.y -= lookAheadY * dt
        } else {
            velocity.x -= (lookAheadX - target.x) * dt
            velocity.y -= (lookAheadY - target.y) * dt
        }

        position.x += velocity.x * dt
        position.y += velocity.y * dt
    }

    /**
     * Moves the camera to follow the target.
     * @param dt {number} Frame seconds
     */
    tick(dt) {

        this.matrix.reset()

        let target = this.target || this.defaultPosition
        this.scale = this.baseScale

        if(this.limit) {
            if (this.viewport.x > this.viewportLimit.x) {
                this.scale = this.viewport.x / this.viewportLimit.x * this.baseScale
            }
            if (this.viewport.y > this.viewportLimit.y) {
                this.scale = Math.max(this.scale, this.viewport.y / this.viewportLimit.y * this.baseScale)
            }
        }

        this.matrix.scale(1 / this.viewport.x * 2, -1 / this.viewport.y * 2)

        if(this.position) {
            if (this.inertial) {

                if(this.targetVelocity) {
                    this.realTarget.x = target.x + this.targetVelocity.x * 0.5
                    this.realTarget.y = target.y + this.targetVelocity.y * 0.5

                    target = this.realTarget
                }

                this.targetPosition(this.position, this.velocity, target, 1.5, dt * 5)
                this.targetPosition(this.shakeVelocity, this.shaking, null, 0.5, dt * 20)

            } else {
                this.velocity.x = 0
                this.velocity.y = 0
                this.position.x = target.x
                this.position.y = target.y
            }
        } else {
            this.position = target.Copy()
        }

        this.matrix.scale(this.scale, this.scale)
        this.matrix.translate(-this.position.x - this.shaking.x, -this.position.y - this.shaking.y)
    }
}

module.exports = Camera