import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import TimerComponent from "src/entity/components/network/timer/timer-component";
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.WEAPON_SINGLE_BARRELLED, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.WEAPON_SINGLE_BARRELLED))
    entity.addComponent(new WeaponComponent())
    entity.addComponent(new TimerComponent().withTransmitter())
})
