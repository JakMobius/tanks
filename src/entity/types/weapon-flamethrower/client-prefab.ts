import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import WeaponReceiverComponent from "src/entity/components/weapon/weapon-receiver-component";
import ClientWeaponComponent from "src/entity/components/weapon/client-weapon-component";

ClientEntityPrefabs.types.set(EntityType.WEAPON_FLAMETHROWER, (entity) => {
    EntityPrefabs.Types.get(EntityType.WEAPON_FLAMETHROWER)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new ClientWeaponComponent())
    entity.addComponent(new WeaponReceiverComponent())
})
