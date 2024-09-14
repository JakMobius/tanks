import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import {Drawer} from "src/entity/types/bullet-42mm/client-side/drawer";

ClientEntityPrefabs.associate(EntityType.BULLET_42MM, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_42MM)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new ClientBulletBehaviourComponent())
    entity.addComponent(new Drawer())
})