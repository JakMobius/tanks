import PhysicalComponent from "./physics-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ExplodeComponent from "src/entity/types/effect-world-explosion/explode-component";
import {WorldComponent} from "src/entity/game-world-entity-prefab";
import WorldTilemapComponent from "src/physics/world-tilemap-component";

export interface ExplodeOnDeathComponentConfig {
    explodePower?: number
}

export default class ExplodeOnDeathComponent extends EventHandlerComponent {

    constructor(config?: ExplodeOnDeathComponentConfig) {
        super()
        config = Object.assign({
            explodePower: 2
        }, config)

        this.eventHandler.on("death", () => {
            let physicalComponent = this.entity.getComponent(PhysicalComponent)
            if (!physicalComponent) return;

            let body = physicalComponent.getBody().GetPosition()

            let explodeEntity = new Entity()
            ServerEntityPrefabs.types.get(EntityType.EFFECT_WORLD_EXPLOSION)(explodeEntity)
            WorldComponent.getWorld(this.entity).getComponent(WorldTilemapComponent).map.appendChild(explodeEntity)
            explodeEntity.getComponent(ExplodeComponent).explode(body.x, body.y, config.explodePower)
            explodeEntity.removeFromParent()
        })
    }
}