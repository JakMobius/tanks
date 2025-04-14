import Entity from "src/utils/ecs/entity";
import Tool from "../tool";
import { EditorOutlineBoundsComponent } from "../../editor-outline-bounds-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import { raycastPolygon } from "src/utils/utils";
import ToolManager from "../toolmanager";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import ArrowDrawer, { ArrowEndStyle } from "src/client/graphics/drawers/arrow-drawer";
import CameraComponent from "src/client/graphics/camera";
import EventEmitter from "src/utils/event-emitter";
import CircleDrawer from "src/client/graphics/drawers/circle-drawer";
import * as Box2D from "@box2d/core"
import { Matrix3, ReadonlyMatrix3 } from "src/utils/matrix3";
import { Modification } from "../../history/history-manager";

export class MovementModification implements Modification {
    entity: Entity
    oldTransform: Matrix3
    newTransform: Matrix3
    actionName = "Перемещение"

    constructor(entity: Entity, oldTransform: Matrix3, newTransform: Matrix3) {
        this.entity = entity
        this.oldTransform = oldTransform
        this.newTransform = newTransform
    }

    perform() {
        let transformComponent = this.entity.getComponent(TransformComponent)
        transformComponent.setTransform(this.newTransform)
        this.entity.emit("request-focus-self")
    }

    revert() {
        let transformComponent = this.entity.getComponent(TransformComponent)
        transformComponent.setTransform(this.oldTransform)
        this.entity.emit("request-focus-self")
    }
}

export interface ArrowControlConfig {
    arrowLength: number,
    headLength: number,
    headWidth: number
}

export default class Cursor extends Tool {

    hoveredControl: "x" | "y" | "xy" | "arc" | null = null

    oldX: number | null = null
    oldY: number | null = null

    clickX: number | null = null
    clickY: number | null = null

    initialEntityTransform: ReadonlyMatrix3 | null = null
    initialEntityLocalTransform: ReadonlyMatrix3 | null = null

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "/static/map-editor/move@3x.png"
        this.shortcutAction = "editor-move-tool"
    }

    cameraDrawCallback = (phase: DrawPhase) => this.drawPreview(phase)

    becomeActive() {
        super.becomeActive()
        let drawer = this.manager.getCamera().getComponent(WorldDrawerComponent)
        drawer.uiDrawPhase.on("draw", this.cameraDrawCallback, EventEmitter.PRIORITY_LOW)
        this.manager.setNeedsRedraw()
    }

    resignActive() {
        super.resignActive();
        let drawer = this.manager.getCamera().getComponent(WorldDrawerComponent)
        drawer.uiDrawPhase.off("draw", this.cameraDrawCallback)
        this.manager.setNeedsRedraw()
    }

    onMouseMove(x: number, y: number): void {
        super.onMouseMove(x, y)

        if(this.dragging) {
            switch(this.hoveredControl) {
                case "x":
                case "y":
                case "xy":
                    this.moveEntity(x, y)
                    this.manager.setNeedsRedraw()
                    break;
                case "arc":
                    this.rotateEntity(x, y)
                    this.manager.setNeedsRedraw()
                default:
                    break
            }
            this.oldX = x
            this.oldY = y
        } else {
            this.updateHover(x, y)
        }
    }

    updateHover(x: number, y: number) {
        let arrow = this.raycastControls(x, y)
        if(this.hoveredControl !== arrow) {
            this.hoveredControl = arrow
            this.updateCursor()
            this.manager.setNeedsRedraw()
        }
        this.oldX = x
        this.oldY = y
    }

    onMouseUp(x: number, y: number): void {
        super.onMouseUp(x, y)

        if(this.hoveredControl) {
            let entity = this.manager.getOnlySelectedEntity()
            let newTransform = entity.getComponent(TransformComponent).getTransform()
            let modification = new MovementModification(entity, this.initialEntityTransform.clone(), newTransform.clone())
            this.manager.editor.getHistoryManager().registerModification(modification)
        }

        this.clickX = null
        this.clickY = null
        
        this.initialEntityLocalTransform = null
        this.initialEntityTransform = null

        this.updateHover(x, y)
        this.updateCursor()
        if(this.hoveredControl) {
            this.manager.setNeedsRedraw()
        }
    }
    
    onMouseDown(x: number, y: number): void {
        super.onMouseDown(x, y) 

        this.updateCursor()
        if(this.hoveredControl) {
            let entity = this.getOnlySelectedEntity()
            let transformComponent = entity?.getComponent(TransformComponent)

            this.oldX = x
            this.oldY = y

            this.clickX = x
            this.clickY = y

            this.initialEntityTransform = transformComponent?.getGlobalTransform()
            this.initialEntityLocalTransform = transformComponent?.getTransform().clone()
        
            this.manager.setNeedsRedraw()
            return
        }

        let clickedEntity = this.raycastEntity(x, y, this.manager.getClientWorld())
        // TODO: hack to avoid raycasting the camera and stuff outside the desired subtree
        if(clickedEntity.parent === this.manager.getClientWorld()) clickedEntity = null
        if(clickedEntity) {
            clickedEntity?.emit("request-focus-self")
        } else {
            this.manager.selectEntities([])
        }
    }

    updateCursor() {
        if(!this.hoveredControl) {
            this.setCursor("default")
            return
        }
        if(this.dragging) {
            this.setCursor("grabbing")
            return
        }
        this.setCursor("grab")
    }

    rotateEntity(x: number, y: number) {
        let entity = this.getOnlySelectedEntity()
        let transformComponent = entity?.getComponent(TransformComponent)
        if(!transformComponent) return

        let position = transformComponent.getGlobalPosition()

        let mouseX = x - position.x
        let mouseY = y - position.y

        let clickX = this.clickX - position.x
        let clickY = this.clickY - position.y

        let mouseAngle = Math.atan2(mouseY, mouseX)
        let clickAngle = Math.atan2(clickY, clickX)
        let deltaAngle = mouseAngle - clickAngle    
        
        let parentTransform = entity.parent?.getComponent(TransformComponent)?.getGlobalTransform()
        if(parentTransform) {
            let direction = parentTransform.getDirection()
            let upDirection = parentTransform.getUpDirection()

            // If parent transform is flipped, the angle should be flipped as well
            if(direction.x * upDirection.y - direction.y * upDirection.x < 0) {
                deltaAngle = -deltaAngle
            }
        }

        let angle = this.initialEntityLocalTransform.getAngle() + deltaAngle
        if(!Number.isFinite(angle)) return

        // Not setting global angle here because parent transform can
        // be non-invertible (if user sets scale to 0 for some reason)
        transformComponent.set({ angle })
    }

    moveEntity(x: number, y: number) {
        let dx = x - this.oldX
        let dy = y - this.oldY

        let entity = this.getOnlySelectedEntity()
        let transformComponent = entity?.getComponent(TransformComponent)
        if(!transformComponent) return

        let parentTransform = entity.parent?.getComponent(TransformComponent)?.getInvertedGlobalTransform()

        let ldx = dx
        let ldy = dy

        if(parentTransform) {
            ldx = parentTransform.transformX(dx, dy, 0)
            ldy = parentTransform.transformY(dx, dy, 0)
        }

        if(this.hoveredControl === "x") ldy = 0
        if(this.hoveredControl === "y") ldx = 0

        let position = transformComponent.getPosition()
        if(!Number.isFinite(position.x + ldx) || !Number.isFinite(position.y + ldy)) return

        transformComponent.set({
            position: {
                x: position.x + ldx,
                y: position.y + ldy
            }
        })
    }

    toScreenPosition(x: number, y: number) {
        let camera = this.manager.getCamera()
        let cameraTransformComponent = camera.getComponent(TransformComponent)
        let cameraTransformMatrix = cameraTransformComponent.getInvertedGlobalTransform()
        let cameraViewport = camera.getComponent(CameraComponent).viewport

        return {
            x: cameraTransformMatrix.transformX(x, y) * cameraViewport.x,
            y: cameraTransformMatrix.transformY(x, y) * cameraViewport.y,
        }
    }

    dissolveVector({ x, y }: Box2D.XY, dirX: Box2D.XY, dirY: Box2D.XY) {
        /*
            newX and newY are calculated by solving the following system:

                (newX, newY) * ( dirX.x, dirX.y ) = (dx, dy)
                               ( dirY.x, dirY.y )

            Multiplying both sides by the inverse of the matrix, we get:

                (newX, newY) = (dx, dy) * ( dirY.y, -dirX.y ) * ( 1 / d )
                                          ( -dirY.x, dirX.x )
        */

        let d = dirX.x * dirY.y - dirX.y * dirY.x
        if(d === 0) return null

        return { 
            x: (x * dirY.y - y * dirY.x) / d,
            y: (-x * dirX.y + y * dirX.x) / d
        }
    }

    getControlsGlobalPosition() {
        let entity = this.getOnlySelectedEntity()
        let transformComponent = entity?.getComponent(TransformComponent)
        if(!transformComponent) return { globalPos: null, globalDirX: null, globalDirY: null }

        let parentTransformComponent = entity.parent?.getComponent(TransformComponent)
        let parentTransformMatrix = parentTransformComponent?.getGlobalTransform()

        let globalPos = transformComponent.getGlobalPosition()
        let globalDirX = parentTransformMatrix?.getDirection() ?? { x: 1, y: 0 }
        let globalDirY = parentTransformMatrix?.getUpDirection() ?? { x: 0, y: 1 }

        if(this.dragging && this.hoveredControl === "arc") {
            let initialAngle = this.initialEntityLocalTransform.getAngle()
            let angle = transformComponent.getAngle()
            let deltaAngle = angle - initialAngle

            if(globalDirX.x * globalDirY.y - globalDirX.y * globalDirY.x < 0) {
                deltaAngle = -deltaAngle
            }

            Box2D.b2Vec2.Rotate(globalDirX, deltaAngle, globalDirX)
            Box2D.b2Vec2.Rotate(globalDirY, deltaAngle, globalDirY)
        }

        return {
            globalPos,
            globalDirX,
            globalDirY
        }
    }

    normalize(vector: Box2D.XY) {
        let length = Math.sqrt(vector.x ** 2 + vector.y ** 2)
        vector.x /= length
        vector.y /= length
        return vector
    }

    getControlsScreenPosition() {
        let {globalPos, globalDirX, globalDirY} = this.getControlsGlobalPosition()
        if(!globalPos) return { screenPos: null, screenDirX: null, screenDirY: null }

        let xIsZero = globalDirX.x === 0 && globalDirX.y === 0
        let yIsZero = globalDirY.x === 0 && globalDirY.y === 0

        if(xIsZero && yIsZero) {
            globalDirX = { x: 1, y: 0 }
            globalDirY = { x: 0, y: 1 }
        } else if(xIsZero) {
            globalDirX = { x: globalDirY.y, y: -globalDirY.x }
        } else if(yIsZero) {
            globalDirY = { x: -globalDirX.y, y: globalDirX.x }
        }

        let camera = this.manager.getCamera()
        let cameraTransformComponent = camera.getComponent(TransformComponent)
        let cameraTransformMatrix = cameraTransformComponent.getInvertedGlobalTransform()
        let cameraViewport = camera.getComponent(CameraComponent).viewport

        let screenPos = {
            x: cameraTransformMatrix.transformX(globalPos.x, globalPos.y) * cameraViewport.x,
            y: cameraTransformMatrix.transformY(globalPos.x, globalPos.y) * cameraViewport.y,
        }

        let screenDirX = this.normalize({
            x: cameraTransformMatrix.transformX(globalDirX.x, globalDirX.y, 0) * cameraViewport.x,
            y: cameraTransformMatrix.transformY(globalDirX.x, globalDirX.y, 0) * cameraViewport.y,
        })

        let screenDirY = this.normalize({
            x: cameraTransformMatrix.transformX(globalDirY.x, globalDirY.y, 0) * cameraViewport.x,
            y: cameraTransformMatrix.transformY(globalDirY.x, globalDirY.y, 0) * cameraViewport.y,
        })

        // If user set scale to 0, screenDirX and screenDirY can be parallel. In this case,
        // just don't show the controls.

        if(Math.abs(screenDirX.x * screenDirY.x + screenDirX.y * screenDirY.y) > 0.99) {
            return { screenPos: null, screenDirX: null, screenDirY: null }
        }

        return { screenPos, screenDirX, screenDirY }
    }

    raycastEntity(x: number, y: number, entity: Entity): Entity | null {
        let children = entity.children
        for(let i = children.length - 1; i >= 0; i--) {
            let child = children[i]
            let result = this.raycastEntity(x, y, child)
            if (result) return result
        }

        let outline = EditorOutlineBoundsComponent.getOutline(entity)
        let transform = entity.getComponent(TransformComponent)?.getInvertedGlobalTransform()

        if(outline && transform) {
            let localX = transform.transformX(x, y)
            let localY = transform.transformY(x, y)
            if(raycastPolygon({ x: localX, y: localY }, outline)) return entity
        }

        return null
    }

    raycastArrow(x: number, y: number, arrow: { arrowLength: number, headLength: number, headWidth: number }) {
        return (
            x < arrow.arrowLength && x > arrow.arrowLength - arrow.headLength &&
            y < arrow.headWidth / 2 && y > -arrow.headWidth / 2
        )
    }

    raycastControls(x: number, y: number): "x" | "y" | "xy" | "arc" | null {
        let controlsPosition = this.getControlsScreenPosition()
        if(!controlsPosition.screenPos) return null

        let screenCoords = this.toScreenPosition(x, y)
        screenCoords.x -= controlsPosition.screenPos.x
        screenCoords.y -= controlsPosition.screenPos.y
        let controlsCoords = this.dissolveVector(screenCoords, controlsPosition.screenDirX, controlsPosition.screenDirY)
        if(!controlsPosition) return null

        let xArrowConfig = this.getArrowConfig("x")
        let yArrowConfig = this.getArrowConfig("y")
        let circleConfig = this.getCircleConfig()
        let arcConfig = this.getArcConfig()

        if(this.raycastArrow(controlsCoords.x, controlsCoords.y, xArrowConfig)) return "x"
        if(this.raycastArrow(controlsCoords.y, controlsCoords.x, yArrowConfig)) return "y"
        if(this.raycastCircle(controlsCoords.x, controlsCoords.y, circleConfig)) return "xy"
        if(this.raycastArc(controlsCoords, screenCoords, arcConfig)) return "arc"

        return null
    }

    raycastCircle(x: number, y: number, circle: { radius: number }): boolean {
        return x ** 2 + y ** 2 < circle.radius ** 2
    }

    raycastArc(controlsCoords: Box2D.XY, screenCoords: Box2D.XY, arc: { minRadius: number, maxRadius: number }) {
        // controlsCoords are used to determine if the mouse is inside the right
        // quadrant of the arc, screenCoords are used to determine if the mouse
        // is at the right distance from the center

        let hitboxPadding = 2
        let distanceSquared = screenCoords.x ** 2 + screenCoords.y ** 2
        if(controlsCoords.x < 0 || controlsCoords.y < 0) return false
        if(distanceSquared < (arc.minRadius - hitboxPadding) ** 2) return false
        return distanceSquared < (arc.maxRadius + hitboxPadding) ** 2
    }

    getArrowConfig(arrow: "x" | "y"): ArrowControlConfig {
        let hovered = this.hoveredControl === arrow

        return hovered ? {
            arrowLength: 62.5,
            headLength: 30,
            headWidth: 25
        } : {
            arrowLength: 60,
            headLength: 25,
            headWidth: 20
        }
    }

    getCircleConfig() {
        let hovered = this.hoveredControl === "xy"
        return hovered ? {
            radius: 12
        } : {
            radius: 8
        }
    }

    getArcConfig() {
        let hovered = this.hoveredControl === "arc"
        return hovered ? {
            minRadius: 52,
            maxRadius: 62
        } : {
            minRadius: 54,
            maxRadius: 60
        }
    }

    getArrowColor(direction: "x" | "y") {
        if(direction === "x") {
            return {
                strokeColor: 0xFF000077,
                fillColor: 0xFF0000FF,
            }
        } else {
            return {
                strokeColor: 0xFF007700,
                fillColor: 0xFF00FF00,
            }
        }
    }

    drawArrow(phase: DrawPhase, position: Box2D.XY, direction: Box2D.XY, type: "x" | "y") {
        let arrowConfig = this.getArrowConfig(type)
        let arrowColors = this.getArrowColor(type)

        ArrowDrawer.drawArrow(phase, {
            ...arrowConfig,
            ...arrowColors,
            start: position,
            end: { x: position.x + direction.x * arrowConfig.arrowLength, y: position.y + direction.y * arrowConfig.arrowLength },
            endStyle: ArrowEndStyle.triangle,
            strokeWidth: 3
        })
    }

    drawArc(phase: DrawPhase, position: Box2D.XY, dirX: Box2D.XY, dirY: Box2D.XY) {
        let entity = this.getOnlySelectedEntity()
        let transformComponent = entity?.getComponent(TransformComponent)
        if(!transformComponent) return

        let arcConfig = this.getArcConfig()

        let xAngle = Math.atan2(dirX.y, dirX.x)
        let yAngle = Math.atan2(dirY.y, dirY.x)

        if(Math.abs(xAngle - yAngle) > Math.PI) {
            if(xAngle < yAngle) xAngle += Math.PI * 2
            else yAngle += Math.PI * 2
        }

        let angleFraction = 1/6

        let startAngle = xAngle * angleFraction + yAngle * (1 - angleFraction)
        let endAngle = yAngle * angleFraction + xAngle * (1 - angleFraction)

        CircleDrawer.drawCircle(phase, position.x, position.y, {
            ...arcConfig,
            strokeColor: 0xFF777777,
            strokeWidth: arcConfig.maxRadius - arcConfig.minRadius,
            steps: 12,
            startAngle,
            endAngle,
            radius: (arcConfig.minRadius + arcConfig.maxRadius) / 2
        })
    }

    drawPreview(phase: DrawPhase) {
        let { screenPos, screenDirX, screenDirY } = this.getControlsScreenPosition()
        if(!screenPos) return

        let draggingControl = this.dragging && this.hoveredControl

        if(!draggingControl || this.hoveredControl === "x") {
            this.drawArrow(phase, screenPos, screenDirX, "x")
        }

        if(!draggingControl || this.hoveredControl === "y") {
            this.drawArrow(phase, screenPos, screenDirY, "y")
        }

        if(!draggingControl || this.hoveredControl === "arc") {
            this.drawArc(phase, screenPos, screenDirX, screenDirY)
        }

        let circleConfig = this.getCircleConfig()

        CircleDrawer.drawCircle(phase, screenPos.x, screenPos.y, {
            ...circleConfig,
            fillColor: 0xFFFFFFFF,
            strokeColor: 0xFF777777,
            strokeWidth: 7,
            steps: 24
        })
    }
}