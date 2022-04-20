import {Component} from "../utils/ecs/component";
import Entity from "../utils/ecs/entity";
import AbstractEffect from "./abstract-effect";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";

export default class EffectHost implements Component {
    entity: Entity | null;
    effects: Map<number, AbstractEffect> = new Map<number, AbstractEffect>()
    protected worldEventHandler = new BasicEventHandlerSet()

    constructor() {
        this.worldEventHandler.on("map-change", () => this.clearEffects())
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.worldEventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.worldEventHandler.setTarget(null)
    }

    addEffect(effect: AbstractEffect) {
        if(effect.model) {
            if (this.effects.has(effect.model.id)) {
                this.removeEffect(effect)
            }
            this.effects.set(effect.model.id, effect)
        }

        effect.onAdded(this)
        this.entity.emit("effect-create", effect)
    }

    getEffectById(id: number) {
        return this.effects.get(id)
    }

    removeEffect(effect: AbstractEffect) {
        effect.onRemoved()
        this.entity.emit("effect-remove", effect)
        if(effect.model) {
            this.effects.delete(effect.model.id)
        }
    }

    clearEffects() {
        for(let effect of this.effects.values()) {
            effect.onRemoved()
            this.entity.emit("effect-remove", effect)
        }
        this.effects.clear()
    }
}