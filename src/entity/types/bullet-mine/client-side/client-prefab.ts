import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import CollisionDisableComponent from "src/entity/components/collision-disable";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import {Drawer} from "src/entity/types/bullet-mine/client-side/drawer";

ClientEntityPrefabs.associate(EntityType.BULLET_MINE, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_MINE)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new Drawer())
    entity.getComponent(CollisionDisableComponent).setCollisionsDisabled(true)
})