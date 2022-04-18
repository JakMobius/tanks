import ClientBullet, {ClientBulletOptions} from '../client-bullet';
import BulletModel16mm from '../../../../entity/bullets/models/16mm-bullet-model';
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import BulletModel from 'src/entity/bullets/bullet-model';
import DrawPhase from "../../../graphics/drawers/draw-phase";
import BulletModelCannonball from "../../../../entity/bullets/models/cannonball-bullet-model";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/16mm/16mm"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.166, 0.5, phase)
    }
}

export default class ClientBullet16mm extends ClientBullet {
    static Model: typeof BulletModel = BulletModel16mm

    constructor(options: ClientBulletOptions) {
        super(options);

        this.model.addComponent(new Drawer())
    }
}
