import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import WeaponReceiverComponent from "src/entity/components/weapon/weapon-receiver-component";
import ClientWeaponComponent from "src/entity/components/weapon/client-weapon-component";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ClientWeaponComponent())
        entity.addComponent(new WeaponReceiverComponent())
    }
})

export default ClientPrefab;