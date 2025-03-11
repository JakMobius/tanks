import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import CollisionDisableComponent from "src/entity/components/collisions/collision-disable";
import { EntityPrefab } from "src/entity/entity-prefabs";
import onSprite from "textures/bullets/mine/on.texture.png"
import offSprite from "textures/bullets/mine/off.texture.png"
import BasicEntityDrawer from "src/client/graphics/drawers/basic-entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import BasePrefab from "./prefab"

export class Drawer extends BasicEntityDrawer {
    public shift: any;
    static spriteNames = [
        onSprite,
        offSprite
    ]

    constructor() {
        super();

        // this.shift = this.entity.id * 350
        this.shift = Math.random() * 350
    }

    draw(phase: DrawPhase) {
        let index = Math.floor((Date.now() + this.shift) / 1000) % 3
        if (index === 2) index = 1
        this.drawSprite(Drawer.getSprite(index), 2.5, 2.5, phase)
    }
}

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureGameWorldEntity(entity)
        entity.addComponent(new Drawer())
        entity.getComponent(CollisionDisableComponent).setCollisionsDisabled(true)
    }
})

export default ClientPrefab;