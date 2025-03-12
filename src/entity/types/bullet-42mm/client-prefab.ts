import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import BulletDrawer from "src/client/graphics/drawers/bullet-drawer";
import BasePrefab from "./prefab"

import sprite from "textures/bullets/42mm/42mm.texture.png"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import HealthReceiver from "src/entity/components/health/health-receiver";
import CollisionIgnoreListReceiver from "src/entity/components/collisions/collision-ignore-list-receiver";

export class Drawer extends BulletDrawer {
    static spriteNames = [sprite]

    draw(phase: DrawPhase) {
        if (!this.entity.getComponent(ClientBulletBehaviourComponent).visible) return
        this.drawTrace(phase, 0.3)
        this.drawSprite(Drawer.getSprite(0), 0.9583, 0.25, phase)
    }
}

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new HealthReceiver())
        entity.addComponent(new CollisionIgnoreListReceiver())

        entity.addComponent(new ClientBulletBehaviourComponent())
        entity.addComponent(new Drawer())
    }
})

export default ClientPrefab;