import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import * as Box2D from "@box2d/core";
import TransformComponent from "./transform/transform-component";
import CameraComponent from "src/client/graphics/camera";

export default class CameraRandomMovement extends EventHandlerComponent {
    private oldScale: number = null
    private oldPosition: Box2D.XY = null

    private targetScale: number | null = null
    private targetPosition: Box2D.XY | null = null

    private timing: number = 0
    private timingVelocity: number = 0.1

    private currentPosition: Box2D.XY | null = null
    private currentVelocity: Box2D.XY = {x: 0, y: 0}

    private currentScale: number | null = null
    private currentScaleVelocity: number = 0

    private mapWidth: number = 0
    private mapHeight: number = 0

    public positionSpringForce = 1
    public scaleSpringForce = 1

    constructor() {
        super()

        this.eventHandler.on("tick", (dt: number) => this.onTick(dt))
    }

    /**
     * Moves the camera to follow the target.
     */
    onTick(dt: number) {
        let cameraComponent = this.entity.getComponent(TransformComponent)

        this.timing += dt * this.timingVelocity

        if(this.targetPosition === null) {
            this.updateTarget()
            this.timing = 0
        }

        if (this.currentPosition === null) {
            this.currentPosition = this.targetPosition
            this.currentScale = this.targetScale
            this.oldPosition = this.targetPosition
            this.oldScale = this.targetScale
            this.updateTarget()
            this.timing = 0
        }

        if (this.timing > 1) {
            this.oldPosition = this.targetPosition
            this.oldScale = this.targetScale
            this.updateTarget()
            this.timing = 0
        }

        let currentTargetScale = this.oldScale * (1 - this.timing) + this.targetScale * this.timing

        let currentTargetX = this.oldPosition.x * (1 - this.timing) + this.targetPosition.x * this.timing
        let currentTargetY = this.oldPosition.y * (1 - this.timing) + this.targetPosition.y * this.timing

        this.currentVelocity.x += (currentTargetX - this.currentPosition.x) * dt * this.positionSpringForce
        this.currentVelocity.y += (currentTargetY - this.currentPosition.y) * dt * this.positionSpringForce
        this.currentScaleVelocity += (currentTargetScale - this.currentScale) * dt * this.scaleSpringForce

        this.currentVelocity.x *= Math.exp(-dt)
        this.currentVelocity.y *= Math.exp(-dt)
        this.currentScaleVelocity *= Math.exp(-dt)

        this.currentPosition.x += this.currentVelocity.x * dt
        this.currentPosition.y += this.currentVelocity.y * dt
        this.currentScale += this.currentScaleVelocity * dt

        let viewport = this.entity.getComponent(CameraComponent).viewport

        cameraComponent.set({
            position: {
                x: this.currentPosition.x,
                y: this.currentPosition.y
            },
            scale: {
                x: viewport.x / this.currentScale / 2,
                y: viewport.y / this.currentScale / 2
            }
        })
    }

    updateTarget() {
        this.targetPosition = {
            x: (Math.random() - 0.5) * this.mapWidth,
            y: (Math.random() - 0.5) * this.mapHeight
        }

        this.targetScale = 2 + Math.random() * 5
    }

    setMapSize(width: number, height: number) {
        this.mapWidth = width
        this.mapHeight = height
        return this
    }
}