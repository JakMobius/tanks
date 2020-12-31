import ClientBullet from '../clientbullet';
import BulletModel16mm from '../../../../entity/bullet/models/16mm';
import BasicEntityDrawer from '../../../graphics/drawers/basicentitydrawer';

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/16mm/16mm"]

    draw(program) {
        this.drawSprite(Drawer.getSprite(0), 4, 12, program)
    }
}

class ClientBullet16mm extends ClientBullet {
    constructor(model) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

ClientBullet.associate(ClientBullet16mm, BulletModel16mm)

export default ClientBullet16mm;