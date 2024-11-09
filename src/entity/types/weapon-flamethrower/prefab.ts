import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.WEAPON_FLAMETHROWER, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.WEAPON_FLAMETHROWER))
    entity.addComponent(new WeaponComponent())
})
