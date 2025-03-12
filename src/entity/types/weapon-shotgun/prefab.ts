
import { EntityPrefab } from "src/entity/entity-prefabs"
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import PrefabComponent from "src/entity/components/prefab-id-component";
import TimerComponent from "../timer/timer-component";

const Prefab = new EntityPrefab({
    id: "WEAPON_SHOTGUN",
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new WeaponComponent())
        entity.addComponent(new TimerComponent())
    }
})

export default Prefab;