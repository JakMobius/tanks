import BasicEntityDrawer from "src/client/graphics/drawers/basic-entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";

import onSprite from "textures/bullets/mine/on.texture.png"
import offSprite from "textures/bullets/mine/off.texture.png"

export class Drawer extends BasicEntityDrawer {
    public shift: any;
    static spriteNames = [
        onSprite,
        offSprite
    ]

    constructor() {
        super();

        // this.shift = this.entity.id * 350
        this.shift = Math.random() * 350
    }

    draw(phase: DrawPhase) {
        let index = Math.floor((Date.now() + this.shift) / 1000) % 3
        if (index === 2) index = 1
        this.drawSprite(Drawer.getSprite(index), 2.5, 2.5, phase)
    }
}