import BasicEntityDrawer from '../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ClientEntityPrefabs from "../client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/16mm/16mm"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.166, 0.5, phase)
    }
}

ClientEntityPrefabs.associate(EntityType.BULLET_16MM, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_16MM)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new Drawer())
})
