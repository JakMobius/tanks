import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import BulletDrawer from "src/client/graphics/drawers/bullet-drawer";

import sprite from "textures/bullets/16mm/16mm.texture.png"

export class Drawer extends BulletDrawer {
    static spriteNames = [sprite]

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return
        this.drawTrace(phase, 0.2)
        this.drawSprite(Drawer.getSprite(0), 0.166, 0.5, phase)
    }
}