
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../../graphics/drawers/draw-phase";
import ClientEntity, {EntityType} from "../../client-entity";
import EntityModel from "../../../../entity/entity-model";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/cannonball/cannonball"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.75, 0.75, phase)
    }
}

ClientEntity.associate(EntityType.BULLET_CANNONBALL, (model) => {
    EntityModel.Types.get(EntityType.BULLET_CANNONBALL)(model)
    model.addComponent(new Drawer())
})