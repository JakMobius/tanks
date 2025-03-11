import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs"
import WeaponReceiverComponent from "src/entity/components/weapon/weapon-receiver-component";
import ClientWeaponComponent from "src/entity/components/weapon/client-weapon-component";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)

        entity.addComponent(new ClientWeaponComponent())
        entity.addComponent(new WeaponReceiverComponent())
    }
})

export default ClientPrefab;