import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import PhysicalComponent from "./physics-component";
import GameWorld from "../../game-world";
import WorldExplodeEffectModel from "../../effects/models/world-explode-effect-model";
import ServerEffect from "../../server/effects/server-effect";
import EffectHostComponent from "../../effects/effect-host-component";

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

        this.eventHandler.on("health-set", (health: number, oldHealth: number) => {
            if (health <= 0 && oldHealth > 0) {
                let physicalComponent = this.entity.getComponent(PhysicalComponent)
                if(!physicalComponent) return;

                let body = physicalComponent.getBody().GetPosition()
                let world = this.entity.parent as GameWorld
                let effect = new WorldExplodeEffectModel({
                    x: body.x,
                    y: body.y,
                    power: config.explodePower
                })

                let serverEffect = ServerEffect.fromModel(effect)
                world.getComponent(EffectHostComponent).addEffect(serverEffect)
            }
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