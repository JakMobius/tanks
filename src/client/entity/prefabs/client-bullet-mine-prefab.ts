import BasicEntityDrawer from '../../graphics/drawers/basic-entity-drawer';
import DrawPhase from "../../graphics/drawers/draw-phase";
import ClientEntityPrefabs from "../client-entity-prefabs";
import EntityPrefabs from "../../../entity/entity-prefabs";
import {EntityType} from "../../../entity/entity-type";

class Drawer extends BasicEntityDrawer {
	public shift: any;
    static spriteNames = [
        "bullets/mine/on",
        "bullets/mine/off"
    ]

    constructor() {
        super();

        // this.shift = this.entity.id * 350
        this.shift = Math.random() * 350
    }

    draw(phase: DrawPhase) {
        let index = Math.floor((Date.now() + this.shift) / 1000) % 3
        if(index === 2) index = 1
        this.drawSprite(Drawer.getSprite(index), 2.5, 2.5, phase)
    }
}

ClientEntityPrefabs.associate(EntityType.BULLET_MINE, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_MINE)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new Drawer())
})