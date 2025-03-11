import { EntityPrefab } from "src/entity/entity-prefabs"
import { WeaponComponent } from "src/entity/components/weapon/weapon-component";
import PrefabComponent from "src/entity/components/prefab-id-component";

const Prefab = new EntityPrefab({
    id: "WEAPON_FLAMETHROWER",
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new WeaponComponent())
    }
})

export default Prefab;