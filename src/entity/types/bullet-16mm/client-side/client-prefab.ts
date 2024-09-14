import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import {Drawer} from "src/entity/types/bullet-16mm/client-side/drawer";

ClientEntityPrefabs.associate(EntityType.BULLET_16MM, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_16MM)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new ClientBulletBehaviourComponent())
    entity.addComponent(new Drawer())
})
