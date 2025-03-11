import PhysicalComponent from "./physics-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import ExplodeComponent from "src/entity/types/effect-world-explosion/explode-component";
import {WorldComponent} from "src/entity/game-world-entity-prefab";
import ExplosionEffectPrefab from "../types/effect-world-explosion/server-prefab";

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
            
            ExplosionEffectPrefab.prefab(explodeEntity)
            WorldComponent.getWorld(this.entity).appendChild(explodeEntity)
            explodeEntity.getComponent(ExplodeComponent).explode(body.x, body.y, config.explodePower)
            explodeEntity.removeFromParent()
        })
    }
}