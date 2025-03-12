import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import * as Box2D from "@box2d/core";
import TransformComponent from "./transform/transform-component";
import CameraComponent from "src/client/graphics/camera";

export default class CameraPositionController extends EventHandlerComponent {
    public baseScale: number = 1
    public defaultPosition = {x: 0, y: 0}
    public velocity = {x: 0, y: 0}
    public realTarget = {x: 0, y: 0}
    public targetVelocity: Box2D.XY | null = null
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
    shakeVelocity = new Box2D.b2Vec2()

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
        let target = this.target || this.defaultPosition
        this.scale = this.baseScale

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

        let viewport = this.entity.getComponent(CameraComponent).viewport

        this.entity.getComponent(TransformComponent).set({
            position: {
                x: this.position.x + this.shaking.x,
                y: this.position.y + this.shaking.y
            },
            scale: {
                x: viewport.x / this.scale / 2,
                y: -viewport.y / this.scale / 2
            },
            // angle: this.inertial ? -Math.atan2(this.velocity.y, this.velocity.x) - Math.PI / 2 : 0
        })
    }

    update() {
        this.onTick(0)
        return this
    }

    setBaseScale(scale: number) {
        this.baseScale = scale
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