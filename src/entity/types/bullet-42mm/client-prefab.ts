import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import BulletDrawer from "src/client/graphics/drawers/bullet-drawer";
import BasePrefab from "./prefab"

import sprite from "textures/bullets/42mm/42mm.texture.png"

export class Drawer extends BulletDrawer {
    static spriteNames = [sprite]

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return
        this.drawTrace(phase, 0.3)
        this.drawSprite(Drawer.getSprite(0), 0.9583, 0.25, phase)
    }
}

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureGameWorldEntity(entity)
        entity.addComponent(new ClientBulletBehaviourComponent())
        entity.addComponent(new Drawer())
    }
})

export default ClientPrefab;