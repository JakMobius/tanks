
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../../graphics/drawers/draw-phase";
import ClientEntity from "../../client-entity";
import EntityModel from "../../../../entity/entity-model";
import ClientBullet from "../client-bullet";
import {EntityType} from "../../../../entity/entity-type";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/42mm/42mm"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.25, 0.9583, phase)
    }
}

ClientEntity.associate(EntityType.BULLET_42MM, (model) => {
    EntityModel.Types.get(EntityType.BULLET_42MM)(model)
    ClientBullet.configureEntity(model)
    model.addComponent(new Drawer())
})