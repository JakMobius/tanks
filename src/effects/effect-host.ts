import {Component} from "../utils/ecs/component";
import Entity from "../utils/ecs/entity";
import AbstractEffect from "./abstract-effect";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";

export default class EffectHost implements Component {
    entity: Entity | null;
    effects: Set<AbstractEffect> = new Set<AbstractEffect>()
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
        if(this.effects.has(effect)) {
            this.removeEffect(effect)
        }

        effect.onAdded(this)
        this.entity.emit("effect-create", effect)
        this.effects.add(effect)
    }

    removeEffect(effect: AbstractEffect) {
        effect.onRemoved()
        this.entity.emit("effect-remove", effect)
        this.effects.delete(effect)
    }

    clearEffects() {
        for(let effect of this.effects) {
            effect.onRemoved()
            this.entity.emit("effect-remove", effect)
        }
        this.effects.clear()
    }
}