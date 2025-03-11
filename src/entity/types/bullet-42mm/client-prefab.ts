import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import BulletDrawer from "src/client/graphics/drawers/bullet-drawer";

import sprite from "textures/bullets/42mm/42mm.texture.png"

export class Drawer extends BulletDrawer {
    static spriteNames = [sprite]

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return
        this.drawTrace(phase, 0.3)
        this.drawSprite(Drawer.getSprite(0), 0.9583, 0.25, phase)
    }
}

ClientEntityPrefabs.types.set(EntityType.BULLET_42MM, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_42MM)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new ClientBulletBehaviourComponent())
    entity.addComponent(new Drawer())
})