import ClientBullet from '../client-bullet';
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import BulletModel from 'src/entity/bullets/bullet-model';
import DrawPhase from "../../../graphics/drawers/draw-phase";
import BulletModelBomb from "../../../../entity/bullets/models/bomb-bullet-model";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/bomb/bomb"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.75, 0.75, phase)
    }
}

export default class ClientBulletBomb extends ClientBullet<BulletModelBomb> {
    static Model: typeof BulletModel = BulletModelBomb

    static getDrawer() { return Drawer }
}