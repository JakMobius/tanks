
import { EntityPrefab } from "src/entity/entity-prefabs"
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import PrefabComponent from "src/entity/components/prefab-id-component";
import TimerComponent from "../timer/timer-component";
import { transmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import TimerTransmitter from "../timer/server-side/timer-transmitter";

const Prefab = new EntityPrefab({
    id: "WEAPON_DOUBLE_BARELLED",
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new WeaponComponent())
        entity.addComponent(new TimerComponent())
        entity.addComponent(transmitterComponentFor(TimerTransmitter))
    }
})

export default Prefab;