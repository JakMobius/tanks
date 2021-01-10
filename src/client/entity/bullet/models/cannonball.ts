import ClientBullet from '../clientbullet';
import BulletModelCannonball from '../../../../entity/bullet/models/cannonball';
import BasicEntityDrawer from '../../../graphics/drawers/basicentitydrawer';
import BulletModel from "../../../../../src/entity/bullet/bulletmodel";
import BulletModel42mm from "../../../../../src/entity/bullet/models/42mm";
import TextureProgram from "../../../graphics/programs/textureprogram";
import EntityModel from "../../../../entity/entitymodel";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/cannonball/cannonball"]

    draw(program: TextureProgram) {
        this.drawSprite(Drawer.getSprite(0), 18, 18, program)
    }
}

class ClientBulletCannonball extends ClientBullet {
    static Model: typeof BulletModel = BulletModelCannonball

    constructor(model: EntityModel) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

export default ClientBulletCannonball;