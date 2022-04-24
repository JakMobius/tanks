
import BasicEntityDrawer from '../../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../../graphics/drawers/draw-phase";
import ClientEntity, {EntityType} from "../../client-entity";
import EntityModel from "../../../../entity/entity-model";
import ClientBullet from "../client-bullet";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/bomb/bomb"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.75, 0.75, phase)
    }
}

ClientEntity.associate(EntityType.BULLET_BOMB, (model) => {
    EntityModel.Types.get(EntityType.BULLET_BOMB)(model)
    ClientBullet.configureEntity(model)
    model.addComponent(new Drawer())
})