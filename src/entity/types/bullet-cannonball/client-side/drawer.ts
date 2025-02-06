import DrawPhase from "src/client/graphics/drawers/draw-phase";
import BulletDrawer from "src/client/graphics/drawers/bullet-drawer";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";

import sprite from "textures/bullets/cannonball/cannonball.texture.png"

export class Drawer extends BulletDrawer {
    static spriteNames = [sprite]

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return
        this.drawTrace(phase, 0.6)
        this.drawSprite(Drawer.getSprite(0), 0.75, 0.75, phase)
    }
}