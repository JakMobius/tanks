import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import TimerComponent from "src/entity/components/network/timer/timer-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.WEAPON_SHOTGUN, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.WEAPON_SHOTGUN))
    entity.addComponent(new WeaponComponent())
    entity.addComponent(new TimerComponent().withTransmitter())
})
