import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import BulletDrawer from "src/client/graphics/drawers/bullet-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";

import sprite from "textures/bullets/16mm/16mm.texture.png"

export class Drawer extends BulletDrawer {
    static spriteNames = [sprite]

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return
        this.drawTrace(phase, 0.2)
        this.drawSprite(Drawer.getSprite(0), 0.5, 0.166, phase)
    }
}

ClientEntityPrefabs.types.set(EntityType.BULLET_16MM, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_16MM)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new ClientBulletBehaviourComponent())
    entity.addComponent(new Drawer())
})
