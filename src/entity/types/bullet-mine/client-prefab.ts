import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import onSprite from "textures/bullets/mine/on.texture.png"
import offSprite from "textures/bullets/mine/off.texture.png"
import BasicEntityDrawer from "src/client/graphics/drawers/basic-entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import HealthReceiver from "src/entity/components/health/health-receiver";
import CollisionIgnoreListReceiver from "src/entity/components/collisions/collision-ignore-list-receiver";

export class Drawer extends BasicEntityDrawer {
    public shift: number;
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
        entity.addComponent(new Drawer())
    }
})

export default ClientPrefab;