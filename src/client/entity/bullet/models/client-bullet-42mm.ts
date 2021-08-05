import ClientBullet from '../client-bullet';
import BulletModel42mm from '../../../../entity/bullets/models/42mm-bullet-model';
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../../graphics/drawers/draw-phase";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/42mm/42mm"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 6, 23, phase)
    }
}

export default class ClientBullet42mm extends ClientBullet<BulletModel42mm> {
    static Model = BulletModel42mm

    static getDrawer() { return Drawer }
}