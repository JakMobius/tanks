import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import BulletDrawer from "src/client/graphics/drawers/bullet-drawer";
import BasePrefab from "./prefab"

import sprite from "textures/bullets/bomb/bomb.texture.png"

export class Drawer extends BulletDrawer {
    static spriteNames = [sprite]

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return
        this.drawTrace(phase, 0.6)
        this.drawSprite(Drawer.getSprite(0), 0.75, 0.75, phase)
    }
}

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureGameWorldEntity(entity)
        entity.addComponent(new Drawer())
        entity.addComponent(new ClientBulletBehaviourComponent({
            hideOnContact: false
        }))
    }
})

export default ClientPrefab;