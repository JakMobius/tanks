import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import MapDrawerComponent from "./client-side/map-drawer-component";
import MapReceiver from "src/entity/components/map/map-receiver";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Игровые элементы",
        displayName: "Карта"
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureGameWorldEntity(entity)
        entity.addComponent(new MapDrawerComponent())
        entity.addComponent(new MapReceiver())
    }
})

export default ClientPrefab;