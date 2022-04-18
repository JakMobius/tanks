import ClientBullet, {ClientBulletOptions} from '../client-bullet';
import BulletModel42mm from '../../../../entity/bullets/models/42mm-bullet-model';
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../../graphics/drawers/draw-phase";
import BulletModel16mm from "../../../../entity/bullets/models/16mm-bullet-model";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/42mm/42mm"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.25, 0.9583, phase)
    }
}

export default class ClientBullet42mm extends ClientBullet {
    static Model = BulletModel42mm

    constructor(options: ClientBulletOptions) {
        super(options);

        this.model.addComponent(new Drawer())
    }
}