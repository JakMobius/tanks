import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../../graphics/drawers/draw-phase";
import ClientEntity from "../../client-entity";
import EntityModel from "../../../../entity/entity-model";
import ClientBullet from "../client-bullet";
import {EntityType} from "../../../../entity/entity-type";

class Drawer extends BasicEntityDrawer {
	public shift: any;
    static spriteNames = [
        "bullets/mine/on",
        "bullets/mine/off"
    ]

    constructor() {
        super();

        // this.shift = this.entity.id * 350
        this.shift = Math.random() * 350
    }

    draw(phase: DrawPhase) {
        let index = Math.floor((Date.now() + this.shift) / 1000) % 3
        if(index === 2) index = 1
        this.drawSprite(Drawer.getSprite(index), 2.5, 2.5, phase)
    }
}

ClientEntity.associate(EntityType.BULLET_MINE, (model) => {
    EntityModel.Types.get(EntityType.BULLET_MINE)(model)
    ClientBullet.configureEntity(model)
    model.addComponent(new Drawer())
})