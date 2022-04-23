
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../../graphics/drawers/draw-phase";
import ClientEntity, {EntityType} from "../../client-entity";
import EntityModel from "../../../../entity/entity-model";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/16mm/16mm"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.166, 0.5, phase)
    }
}

ClientEntity.associate(EntityType.BULLET_16MM, (model) => {
    EntityModel.Types.get(EntityType.BULLET_16MM)(model)
    model.addComponent(new Drawer())
})
