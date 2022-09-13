import BasicEntityDrawer from '../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ClientEntityPrefabs from "../client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/cannonball/cannonball"]

    draw(phase: DrawPhase) {
        this.drawSprite(Drawer.getSprite(0), 0.75, 0.75, phase)
    }
}

ClientEntityPrefabs.associate(EntityType.BULLET_CANNONBALL, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_CANNONBALL)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new Drawer())
})