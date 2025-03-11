import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import BulletDrawer from "src/client/graphics/drawers/bullet-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import BasePrefab from "./prefab"

import sprite from "textures/bullets/16mm/16mm.texture.png"

export class Drawer extends BulletDrawer {
    static spriteNames = [sprite]

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return
        this.drawTrace(phase, 0.2)
        this.drawSprite(Drawer.getSprite(0), 0.5, 0.166, phase)
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