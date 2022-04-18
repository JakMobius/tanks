import ClientBullet from '../client-bullet';
import BulletModelMine from '../../../../entity/bullets/models/mine-bullet-model';
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import ClientEntity from "../../client-entity";
import DrawPhase from "../../../graphics/drawers/draw-phase";

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

    draw(phase: DrawPhase) {
        let index = Math.floor((Date.now() + this.shift) / 1000) % 3
        if(index === 2) index = 1
        this.drawSprite(Drawer.getSprite(index), 2.5, 2.5, phase)
    }
}

export default class ClientBulletMine extends ClientBullet<BulletModelMine> {
    static Model = BulletModelMine

    static getDrawer() { return Drawer }
}