import BasicEntityDrawer from '../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../graphics/drawers/draw-phase";
import ClientEntityPrefabs from "../client-entity-prefabs";
import EntityPrefabs from "../../../entity/entity-prefabs";
import {EntityType} from "../../../entity/entity-type";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/42mm/42mm"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.25, 0.9583, phase)
    }
}

ClientEntityPrefabs.associate(EntityType.BULLET_42MM, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_42MM)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new Drawer())
})