import ClientBullet from '../client-bullet';
import BulletModel16mm from '../../../../entity/bullets/models/16mm-bullet-model';
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import BulletModel from 'src/entity/bullets/bullet-model';
import DrawPhase from "../../../graphics/drawers/draw-phase";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/16mm/16mm"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 4, 12, phase)
    }
}

export default class ClientBullet16mm extends ClientBullet<BulletModel16mm> {
    static Model: typeof BulletModel = BulletModel16mm

    static getDrawer() { return Drawer }
}
