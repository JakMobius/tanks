import ClientBullet from '../clientbullet';
import BulletModel42mm from '../../../../entity/bullet/models/42mm';
import BasicEntityDrawer from '../../../graphics/drawers/basicentitydrawer';
import BulletModel from "../../../../../src/entity/bullet/bulletmodel";
import TextureProgram from "../../../graphics/programs/textureprogram";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/42mm/42mm"]

    draw(program: TextureProgram) {
        this.drawSprite(Drawer.getSprite(0), 6, 23, program)
    }
}

class ClientBullet42mm extends ClientBullet {
    static Model: typeof BulletModel = BulletModel42mm

    constructor(model: BulletModel) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

export default ClientBullet42mm;