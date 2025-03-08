import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import TilemapComponent from "src/map/tilemap-component";
import ChunkedMapCollider from "src/physics/chunked-map-collider";
import TransformComponent from "src/entity/components/transform-component";
import ChildTickComponent from "src/entity/components/child-tick-component";

EntityPrefabs.Types.set(EntityType.TILEMAP, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.TILEMAP))
    entity.addComponent(new TilemapComponent())
    entity.addComponent(new TransformComponent())
    entity.addComponent(new ChunkedMapCollider())

    entity.getComponent(TransformComponent).set({ scale: { x: TilemapComponent.DEFAULT_SCALE, y: TilemapComponent.DEFAULT_SCALE } })

    // TODO: temporary, until map editor is implemented properly
    entity.addComponent(new ChildTickComponent())
})