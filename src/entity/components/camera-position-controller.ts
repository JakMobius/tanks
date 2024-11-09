import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import * as Box2D from "src/library/box2d";
import CameraComponent from "src/client/graphics/camera";
import {inverse} from "src/utils/matrix3";
import Entity from "src/utils/ecs/entity";

export default class CameraPositionController extends EventHandlerComponent {
    public baseScale: number = 1
    public defaultPosition = {x: 0, y: 0}
    public velocity = {x: 0, y: 0}
    public realTarget = {x: 0, y: 0}
    public targetVelocity: Box2D.XY | null = null
    public viewportLimit: Box2D.XY | null = {x: 1440, y: 900}
    public scale: number = 1
    public viewport: Box2D.XY

    target: Box2D.XY | null = null

    /**
     * Enable inertial camera movement.
     */
    inertial = false

    /**
     * Camera position (exclude camera shaking)
     */
    position: Box2D.XY | null = null

    /**
     * Camera position delta
     */
    shaking: Box2D.XY = {x: 0, y: 0}

    /**
     * Camera shaking velocity
     */
    shakeVelocity = new Box2D.Vec2()

    constructor() {
        super()

        this.eventHandler.on("tick", (dt: number) => this.onTick(dt))
    }

    targetPosition(position: Box2D.XY, velocity: Box2D.XY, target: Box2D.XY, lookahead: number, dt: number) {
        let lookAheadX = position.x + velocity.x * lookahead
        let lookAheadY = position.y + velocity.y * lookahead

        if (target == null) {
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
    onTick(dt: number) {
        let cameraComponent = this.entity.getComponent(CameraComponent)
        let matrix = cameraComponent.matrix

        matrix.reset()

        let target = this.target || this.defaultPosition
        this.scale = this.baseScale

        if (this.viewportLimit !== null) {
            if (this.viewport.x > this.viewportLimit.x) {
                this.scale = this.viewport.x / this.viewportLimit.x * this.baseScale
            }
            if (this.viewport.y > this.viewportLimit.y) {
                this.scale = Math.max(this.scale, this.viewport.y / this.viewportLimit.y * this.baseScale)
            }
        }

        matrix.scale(1 / this.viewport.x * 2, -1 / this.viewport.y * 2)

        if (this.position) {
            if (this.inertial) {

                if (this.targetVelocity) {
                    this.realTarget.x = target.x + this.targetVelocity.x * 0.5
                    this.realTarget.y = target.y + this.targetVelocity.y * 0.5

                    target = this.realTarget
                }

                this.targetPosition(this.position, this.velocity, target, 1.5, dt * 5)

                // TODO: this goes crazy when fps is low
                this.targetPosition(this.shakeVelocity, this.shaking, null, 0.3, dt * 37)

            } else {
                this.velocity.x = 0
                this.velocity.y = 0
                this.position.x = target.x
                this.position.y = target.y
            }
        } else {
            this.position = {
                x: target.x,
                y: target.y
            }
        }

        matrix.scale(this.scale, this.scale)
        matrix.translate(-this.position.x - this.shaking.x, -this.position.y - this.shaking.y)

        cameraComponent.updateInverseMatrix()
    }

    update() {
        this.onTick(0)
        return this
    }

    setBaseScale(scale: number) {
        this.baseScale = scale
        return this
    }

    setViewport(viewport: Box2D.XY) {
        this.viewport = viewport
        return this
    }

    setViewportLimit(limit: Box2D.XY) {
        this.viewportLimit = limit
        return this
    }

    setDefaultPosition(position: Box2D.XY) {
        this.defaultPosition = position
        return this
    }

    setTarget(target: Box2D.XY) {
        this.target = target
        return this
    }

    setTargetVelocity(targetVelocity: Box2D.XY) {
        this.targetVelocity = targetVelocity
        return this
    }

    setInertial(inertial: boolean) {
        this.inertial = inertial
        return this
    }

    reset() {
        this.position = {
            x: this.defaultPosition.x,
            y: this.defaultPosition.y,
        }

        this.shaking.x = 0
        this.shaking.y = 0
        this.shakeVelocity.x = 0
        this.shakeVelocity.y = 0

        return this
    }
}