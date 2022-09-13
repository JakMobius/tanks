import BasicEntityDrawer from '../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../graphics/drawers/draw-phase";
import ClientEntityPrefabs from "../client-entity-prefabs";
import EntityPrefabs from "../../../entity/entity-prefabs";
import {EntityType} from "../../../entity/entity-type";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/bomb/bomb"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.75, 0.75, phase)
    }
}

ClientEntityPrefabs.associate(EntityType.BULLET_BOMB, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_BOMB)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new Drawer())
})