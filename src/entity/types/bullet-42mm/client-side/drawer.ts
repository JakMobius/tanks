import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import BulletDrawer from "src/client/graphics/drawers/bullet-drawer";

export class Drawer extends BulletDrawer {
    static spriteNames = ["bullets/42mm/42mm"]

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return
        this.drawTrace(phase, 0.3)
        this.drawSprite(Drawer.getSprite(0), 0.25, 0.9583, phase)
    }
}