import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ToolManager from "../toolmanager";
import Cursor, { ArrowControlConfig } from "./cursor";
import ArrowDrawer, { ArrowEndStyle } from "src/client/graphics/drawers/arrow-drawer";
import * as Box2D from "@box2d/core"
import TransformComponent from "src/entity/components/transform/transform-component";

export default class Scale extends Cursor {

    defaultArrowLength = 90
    defaultArrowWidth = 20
    hoverArrowWidth = 25

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "/static/map-editor/scale@3x.png"
        this.shortcutAction = "editor-scale-tool"
    }

    getArrowConfig(type: "x" | "y"): ArrowControlConfig {
        let hovered = type === this.hoveredControl
        
        if(!hovered) {
            return {
                arrowLength: this.defaultArrowLength + this.defaultArrowWidth / 2,
                headLength: this.defaultArrowWidth,
                headWidth: this.defaultArrowWidth
            }
        }

        let length = this.defaultArrowLength + this.hoverArrowWidth / 2

        if(this.dragging) {
            const transformComponent = this.getOnlySelectedEntity().getComponent(TransformComponent)
            const transform = transformComponent.getGlobalTransform()
            const testVector = type === "x" ? { x: 1, y: 0 } : { x: 0, y: 1 }

            const initialX = this.initialEntityTransform.transformX(testVector.x, testVector.y, 0)
            const initialY = this.initialEntityTransform.transformY(testVector.x, testVector.y, 0)

            const currentX = transform.transformX(testVector.x, testVector.y, 0)
            const currentY = transform.transformY(testVector.x, testVector.y, 0)

            // Project current on initial
            const currentScale = (currentX * initialX + currentY * initialY) / (initialX ** 2 + initialY ** 2)

            length = this.defaultArrowLength * currentScale
            if(currentScale > 0) {
                length += this.hoverArrowWidth / 2
            } else {
                length -= this.hoverArrowWidth / 2
            }
        } 

        return {
            arrowLength: length,
            headLength: this.hoverArrowWidth,
            headWidth: this.hoverArrowWidth
        }
    }

    toControlsPosition(x: number, y: number, controlsPosition: { screenPos: Box2D.XY, screenDirX: Box2D.XY, screenDirY: Box2D.XY }) {
        
        let screenCoords = this.toScreenPosition(x, y)
        screenCoords.x -= controlsPosition.screenPos.x
        screenCoords.y -= controlsPosition.screenPos.y
        let controlsCoords = this.dissolveVector(screenCoords, controlsPosition.screenDirX, controlsPosition.screenDirY)
        if(!controlsPosition) return null

        return controlsCoords
    }

    moveEntity(x: number, y: number) {
        if(this.hoveredControl === "xy") {
            super.moveEntity(x, y)
            return
        }

        let controlsPosition = this.getControlsScreenPosition()
        if(!controlsPosition.screenPos) return
        
        let entity = this.getOnlySelectedEntity()
        let transformComponent = entity?.getComponent(TransformComponent)
        if(!transformComponent) return

        let controlsCoords = this.toControlsPosition(x, y, controlsPosition)
        let controlsClickCoords = this.toControlsPosition(this.clickX, this.clickY, controlsPosition)

        let clickOffsetX = controlsClickCoords.x - this.defaultArrowLength
        let clickOffsetY = controlsClickCoords.y - this.defaultArrowLength

        let coefX = (controlsCoords.x - clickOffsetX) / this.defaultArrowLength
        let coefY = (controlsCoords.y - clickOffsetY) / this.defaultArrowLength

        if(this.hoveredControl === "x") coefY = 1
        if(this.hoveredControl === "y") coefX = 1

        let scale = this.initialEntityLocalTransform.getScale()

        if(!Number.isFinite(scale.x * coefX) || !Number.isFinite(scale.y * coefY)) return

        transformComponent.set({
            angle: this.initialEntityLocalTransform.getAngle(),
            scale: {
                x: scale.x * coefX,
                y: scale.y * coefY
            }
        })
    }

    drawArrow(phase: DrawPhase, position: Box2D.XY, direction: Box2D.XY, type: "x" | "y") {
        let arrowConfig = this.getArrowConfig(type)
        let arrowColors = this.getArrowColor(type)

        ArrowDrawer.drawArrow(phase, {
            ...arrowConfig,
            ...arrowColors,
            start: position,
            end: { x: position.x + direction.x * arrowConfig.arrowLength, y: position.y + direction.y * arrowConfig.arrowLength },
            endStyle: ArrowEndStyle.square,
            strokeWidth: 3
        })
    }

    getControlsGlobalPosition() {
        let transform

        if(this.dragging) {
            if(this.hoveredControl === "x" || this.hoveredControl === "y") {
                // When the scale sign is changed, the controls transform should not flip.
                // So initial transform is used when x or y arrows are dragged.
                transform = this.initialEntityTransform
            }
        }

        if(!transform) {
            let entity = this.getOnlySelectedEntity()
            transform = entity?.getComponent(TransformComponent)?.getGlobalTransform()
        }
        
        if(!transform) return { globalPos: null, globalDirX: null, globalDirY: null }

        let globalPos = transform.getPosition()

        return {
            globalPos,
            globalDirX: transform.getDirection(),
            globalDirY: transform.getUpDirection()
        }
    }
}