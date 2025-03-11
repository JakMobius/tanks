import { EntityPrefab } from "src/entity/entity-prefabs";
import PrefabComponent from "src/entity/components/prefab-id-component";
import TilemapComponent from "src/map/tilemap-component";
import ChunkedMapCollider from "src/physics/chunked-map-collider";
import TransformComponent from "src/entity/components/transform/transform-component";

const Prefab = new EntityPrefab({
    id: "TILEMAP",
    metadata: {
        displayName: "Карта",
    },
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new TilemapComponent())
        entity.addComponent(new TransformComponent())
        entity.addComponent(new ChunkedMapCollider())

        entity.getComponent(TransformComponent).set({ scale: { x: TilemapComponent.DEFAULT_SCALE, y: TilemapComponent.DEFAULT_SCALE } })
    }
})

export default Prefab;