import ClientBullet from '../client-bullet';
import BulletModelCannonball from '../../../../entity/bullets/models/cannonball-bullet-model';
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../../graphics/drawers/draw-phase";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/cannonball/cannonball"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 18, 18, phase)
    }
}

export default class ClientBulletCannonball extends ClientBullet<BulletModelCannonball> {
    static Model = BulletModelCannonball

    static getDrawer() { return Drawer }
}