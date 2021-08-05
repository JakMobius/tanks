
import * as Box2D from '../library/box2d';
import Matrix3 from "../utils/matrix3";

export interface CameraConfig {
    baseScale?: number
    target?: Box2D.Vec2
    inertial?: boolean
    viewportLimit?: Box2D.Vec2
    defaultPosition: Box2D.Vec2
    viewport: Box2D.Vec2
    limit?: boolean
}

export default class Camera {
	public baseScale: number;
	public viewport: Box2D.Vec2
	public defaultPosition: Box2D.Vec2
	public velocity: Box2D.Vec2
	public realTarget: Box2D.Vec2
	public targetVelocity: Box2D.Vec2
	public limit: boolean
	public viewportLimit: Box2D.Vec2
	public scale: number

    matrix: Matrix3 = null

    /**
     * Enable inertial camera movement.
     */
    inertial = false

    /**
     * Camera position (exclude camera shaking)
     */
    position?: Box2D.Vec2 = null

    /**
     * Camera position delta
     */
    shaking: Box2D.Vec2 = null

    /**
     * Camera shaking velocity
     */
    shakeVelocity: Box2D.Vec2 = null

    target: Box2D.Vec2 = null

    constructor(options: CameraConfig) {
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

        this.velocity = new Box2D.Vec2()
        this.shaking = new Box2D.Vec2()
        this.shakeVelocity = new Box2D.Vec2()
        this.realTarget = new Box2D.Vec2()
        this.targetVelocity = null

        this.limit = options.limit
        this.viewportLimit = null

        if(this.limit) {
            this.viewportLimit = options.viewportLimit || new Box2D.Vec2(1440, 900)
        }

        this.matrix = new Matrix3()
        this.inertial = options.inertial
    }

    reset() {
        if(this.position) {
            this.position.x = this.defaultPosition.x
            this.position.y = this.defaultPosition.y
        } else {
            this.position = this.defaultPosition.Clone()
        }
        this.shaking.x = 0
        this.shaking.y = 0
        this.shakeVelocity.x = 0
        this.shakeVelocity.y = 0
    }

    getPosition() {
        return new Box2D.Vec2(this.position.x + this.shaking.x, this.position.y + this.shaking.y)
    }

    targetPosition(position: Box2D.Vec2, velocity: Box2D.Vec2, target: Box2D.Vec2, lookahead: number, dt: number) {
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
     */
    tick(dt: number) {

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
            this.position = target.Clone()
        }

        this.matrix.scale(this.scale, this.scale)
        this.matrix.translate(-this.position.x - this.shaking.x, -this.position.y - this.shaking.y)
    }
}