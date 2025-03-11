import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import TimerComponent from "../timer/timer-component";
import TimerTransmitter from "../timer/server-prefab";
import { transmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";

EntityPrefabs.Types.set(EntityType.WEAPON_DOUBLE_BARELLED, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.WEAPON_DOUBLE_BARELLED))
    entity.addComponent(new WeaponComponent())
    entity.addComponent(new TimerComponent())
    entity.addComponent(transmitterComponentFor(TimerTransmitter))
})
