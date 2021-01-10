import ClientBullet from '../clientbullet';
import BulletModel16mm from '../../../../entity/bullet/models/16mm';
import BasicEntityDrawer from '../../../graphics/drawers/basicentitydrawer';
import BulletModel from 'src/entity/bullet/bulletmodel';
import TextureProgram from 'src/client/graphics/programs/textureprogram';
import EntityModel from "../../../../entity/entitymodel";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/16mm/16mm"]

    draw(program: TextureProgram) {
        this.drawSprite(Drawer.getSprite(0), 4, 12, program)
    }
}

class ClientBullet16mm extends ClientBullet {
    static Model: typeof BulletModel = BulletModel16mm

    constructor(model: EntityModel) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

export default ClientBullet16mm;