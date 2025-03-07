import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import WeaponReceiverComponent from "src/entity/components/weapon/weapon-receiver-component";
import TimerReceiverComponent from "src/entity/components/network/timer/timer-receiver";
import ClientWeaponComponent from "src/entity/components/weapon/client-weapon-component";
import WeaponSoundComponent from "src/client/entity/components/sound/weapon-sound-component";

ClientEntityPrefabs.types.set(EntityType.WEAPON_DOUBLE_BARELLED, (entity) => {
    EntityPrefabs.Types.get(EntityType.WEAPON_DOUBLE_BARELLED)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new ClientWeaponComponent())
    entity.addComponent(new WeaponSoundComponent())
    entity.addComponent(new TimerReceiverComponent())
    entity.addComponent(new WeaponReceiverComponent())
})
