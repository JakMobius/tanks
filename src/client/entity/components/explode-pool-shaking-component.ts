import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import Entity from "src/utils/ecs/entity";
import {ExplodeEffectEntityAffectControllerConfig} from "src/effects/explode/explode-effect-entity-affect-controller";
import CameraComponent from "src/client/graphics/camera";
import CameraPositionController from "src/entity/components/camera-position-controller";

export default class ExplodePoolShakingComponent extends EventHandlerComponent {

    private cameras = new Set<Entity>()
    private shakeSpeedCoefficient: number = 2.0
    private amplificationCoefficient: number = 30.0

    constructor(config?: ExplodeEffectEntityAffectControllerConfig) {
        super()

        this.eventHandler.on("explode-pool-tick", (dt) => {
            this.tickEntities(dt)
        })

        this.eventHandler.on("camera-attach", (camera: Entity) => {
            this.cameras.add(camera)
        })

        this.eventHandler.on("camera-detach", (camera: Entity) => {
            this.cameras.delete(camera)
        })
    }

    private tickEntities(dt: number): void {
        let pool = this.entity.getComponent(ExplodeEffectPool)

        for (let camera of this.cameras) {
            let cameraComponent = camera.getComponent(CameraComponent)
            if (!cameraComponent) continue

            let cameraX = cameraComponent.inverseMatrix.transformX(0, 0)
            let cameraY = cameraComponent.inverseMatrix.transformY(0, 0)

            let pressure = pool.poolPressureAt(cameraX, cameraY)

            let positionController = camera.getComponent(CameraPositionController)
            let shakeVelocity = positionController.shakeVelocity.Length()

            let amplification = (pressure * this.shakeSpeedCoefficient - shakeVelocity) * this.amplificationCoefficient

            if (amplification > 0) {
                positionController.shakeVelocity.x += Math.random() * amplification * dt
                positionController.shakeVelocity.y += Math.random() * amplification * dt

                positionController.shakeVelocity.x *= Math.exp(dt * amplification)
                positionController.shakeVelocity.y *= Math.exp(dt * amplification)
            }
        }
    }
}