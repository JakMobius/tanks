import BasicEntityDrawer from "src/client/graphics/drawers/basic-entity-drawer";
import TransformComponent from "src/entity/components/transform-component";
import LineDrawer from "src/client/graphics/drawers/line-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import {Vec2} from "src/library/box2d";

export default class BulletDrawer extends BasicEntityDrawer {
    oldPosition: Vec2 | null = null

    drawTrace(phase: DrawPhase, thickness: number) {
        let position = this.entity.getComponent(TransformComponent).getPosition()
        if (this.oldPosition) {
            LineDrawer.drawLine(phase, position.x, position.y, this.oldPosition.x, this.oldPosition.y, 0xFFBBBBBB, thickness)
        }
        this.oldPosition = position
    }
}