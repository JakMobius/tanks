import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import CollisionDisableComponent from "src/entity/components/collisions/collision-disable";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import onSprite from "textures/bullets/mine/on.texture.png"
import offSprite from "textures/bullets/mine/off.texture.png"
import BasicEntityDrawer from "src/client/graphics/drawers/basic-entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";

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

ClientEntityPrefabs.types.set(EntityType.BULLET_MINE, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_MINE)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new Drawer())
    entity.getComponent(CollisionDisableComponent).setCollisionsDisabled(true)
})