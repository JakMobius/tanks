import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import TilemapComponent from "src/map/tilemap-component";
import ChunkedMapCollider from "src/physics/chunked-map-collider";
import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";

EntityPrefabs.Types.set(EntityType.TILEMAP, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.TILEMAP))
    entity.addComponent(new TilemapComponent())
    entity.addComponent(new ChunkedMapCollider())
})