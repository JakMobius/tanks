
import ClientBullet from '../clientbullet';
import BulletModelMine from '../../../../entity/bullet/models/mine';
import BasicEntityDrawer from '../../../graphics/drawers/basicentitydrawer';
import BulletModel from "../../../../../src/entity/bullet/bulletmodel";
import BulletModelCannonball from "../../../../../src/entity/bullet/models/cannonball";
import ClientEntity from "../../cliententity";
import TextureProgram from "../../../graphics/programs/textureprogram";
import EntityModel from "../../../../entity/entitymodel";

class Drawer extends BasicEntityDrawer {
	public shift: any;
    static spriteNames = [
        "bullets/mine/on",
        "bullets/mine/off"
    ]

    constructor(entity: ClientEntity) {
        super(entity);

        this.shift = this.entity.model.id * 350
    }

    draw(program: TextureProgram) {
        let index = Math.floor((Date.now() + this.shift) / 1000) % 3
        if(index === 2) index = 1
        this.drawSprite(Drawer.getSprite(index), 60, 60, program)
    }
}

class ClientBulletMine extends ClientBullet {
    static Model: typeof BulletModel = BulletModelMine

    constructor(model: EntityModel) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

export default ClientBulletMine;