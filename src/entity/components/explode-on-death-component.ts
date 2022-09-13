import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import PhysicalComponent from "./physics-component";
import WorldExplodeEffectModel from "src/effects/models/world-explode-effect-model";
import ServerEffect from "src/server/effects/server-effect";
import EffectHostComponent from "src/effects/effect-host-component";

export interface ExplodeOnDeathComponentConfig {
    explodePower?: number
}

export default class ExplodeOnDeathComponent implements Component {
    entity: Entity | null;
    eventHandler = new BasicEventHandlerSet()

    constructor(config?: ExplodeOnDeathComponentConfig) {
        config = Object.assign({
            explodePower: 2
        }, config)

        this.eventHandler.on("death", () => {
            let physicalComponent = this.entity.getComponent(PhysicalComponent)
            if(!physicalComponent) return;

            let body = physicalComponent.getBody().GetPosition()
            let world = this.entity.parent
            let effect = new WorldExplodeEffectModel({
                x: body.x,
                y: body.y,
                power: config.explodePower
            })

            let serverEffect = ServerEffect.fromModel(effect)
            world.getComponent(EffectHostComponent).addEffect(serverEffect)
        })
    }

    onAttach(entity: Entity): void {
        this.eventHandler.setTarget(entity)
        this.entity = entity
    }

    onDetach(): void {
        this.eventHandler.setTarget(null)
        this.entity = null
    }
}