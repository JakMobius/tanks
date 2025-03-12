

import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import DrawPhase from "../graphics/drawers/draw-phase";
import LineDrawer from "../graphics/drawers/line-drawer";
import CameraComponent from "../graphics/camera";
import { EditorOutlineBoundsComponent } from "./editor-outline-bounds-component";

export default class EditorOutlineDrawerComponent extends EventHandlerComponent {
    public enabled: boolean = true

    drawCallback = (phase: DrawPhase) => this.draw(phase)

    cameras = new Set<Entity>()
    focused: boolean = false

    constructor() {
        super()
        this.eventHandler.on("camera-attach", (camera: Entity) => {
            this.cameras.add(camera)
            this.subscribeToCamera(camera)
        })

        this.eventHandler.on("camera-detach", (camera: Entity) => {
            this.cameras.delete(camera)
            this.unsubscribeFromCamera(camera)
        })

        this.eventHandler.on("editor-focus", () => this.onFocus())
        this.eventHandler.on("editor-blur", () => this.onBlur())
    }

    subscribeToCamera(camera: Entity) {
        if(!this.focused) return
        camera.getComponent(WorldDrawerComponent).uiDrawPhase.on("draw", this.drawCallback)
    }

    unsubscribeFromCamera(camera: Entity) {
        camera.getComponent(WorldDrawerComponent).uiDrawPhase.off("draw", this.drawCallback)
    }

    onFocus() {
        this.focused = true
        for(let camera of this.cameras) this.subscribeToCamera(camera)
    }

    onBlur() {
        this.focused = false
        for(let camera of this.cameras) this.unsubscribeFromCamera(camera)
    }

    /**
     * Draws the specified entity.
     */

    draw(phase: DrawPhase) {
        const vertices = EditorOutlineBoundsComponent.getOutline(this.entity)

        const transform = this.entity.getComponent(TransformComponent)
        if(!transform) return

        const cameraTransform = phase.camera.getComponent(TransformComponent)
        const cameraMatrix = cameraTransform.getInvertedGlobalTransform()
        const cameraViewport = phase.camera.getComponent(CameraComponent).viewport
        
        let outlineColor = 0xFFE98C0C

        let matrix = transform.getGlobalTransform()

        let shape = []

        for(let i = 0; i < vertices.length; i++) {
            let point = vertices[i]

            let gx = matrix.transformX(point.x, point.y)
            let gy = matrix.transformY(point.x, point.y)

            let sx = cameraMatrix.transformX(gx, gy) * cameraViewport.x
            let sy = cameraMatrix.transformY(gx, gy) * cameraViewport.y

            shape.push(sx)
            shape.push(sy)
        }

        LineDrawer.strokeShape(phase, shape, outlineColor, 5, true)
    }
}