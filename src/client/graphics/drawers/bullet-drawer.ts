import BasicEntityDrawer from "src/client/graphics/drawers/basic-entity-drawer";
import TransformComponent from "src/entity/components/transform-component";
import LineDrawer from "src/client/graphics/drawers/line-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import * as Box2D from "@box2d/core";

export default class BulletDrawer extends BasicEntityDrawer {
    oldPosition: Box2D.XY | null = null

    drawTrace(phase: DrawPhase, thickness: number) {
        let position = this.entity.getComponent(TransformComponent).getPosition()
        if (this.oldPosition) {
            LineDrawer.drawLine(phase, position.x, position.y, this.oldPosition.x, this.oldPosition.y, 0xFFBBBBBB, thickness)
        }
        this.oldPosition = position
    }
}