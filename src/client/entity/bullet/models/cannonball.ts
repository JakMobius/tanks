import ClientBullet from '../clientbullet';
import BulletModelCannonball from '../../../../entity/bullet/models/cannonball';
import BasicEntityDrawer from '../../../graphics/drawers/basicentitydrawer';

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/cannonball/cannonball"]

    draw(program) {
        this.drawSprite(Drawer.getSprite(0), 18, 18, program)
    }
}

class ClientBulletCannonball extends ClientBullet {
    constructor(model) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

ClientBullet.associate(ClientBulletCannonball, BulletModelCannonball)

export default ClientBulletCannonball;