import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import {Drawer} from "src/entity/types/bullet-cannonball/client-side/drawer";

ClientEntityPrefabs.associate(EntityType.BULLET_CANNONBALL, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_CANNONBALL)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new Drawer())
    entity.addComponent(new ClientBulletBehaviourComponent())
})