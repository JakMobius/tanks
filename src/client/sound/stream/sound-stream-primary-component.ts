import SoundEffect from "../sound/sound-effect";
import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import SoundEngine from "../sound-engine";

export class SoundStreamPrimaryComponent implements Component {
    entity: Entity | null
    public source: GainNode
    public destination: GainNode
    private effects: SoundEffect | null

    constructor(engine: SoundEngine) {
        this.source = new GainNode(engine.context)
        this.destination = new GainNode(engine.context)

        this.source.connect(this.destination)
    }

    addEffect(effect: SoundEffect) {
        effect.previousEffect = this.effects
        effect.nextEffect = null
        if(this.effects) {
            this.effects.nextEffect = effect
            this.effects = effect
        }

        if(effect.previousEffect) {
            effect.previousEffect.getDestination().disconnect()
            effect.previousEffect.getDestination().connect(effect.getSource())
        } else {
            this.source.disconnect()
            this.source.connect(effect.getSource())
        }
        effect.getDestination().connect(this.destination)
    }

    removeEffect(effect: SoundEffect) {

        if(effect.previousEffect) {
            effect.previousEffect.getDestination().disconnect()
            if(effect.nextEffect) {
                effect.previousEffect.getDestination().connect(effect.nextEffect.getSource())
            } else {
                effect.previousEffect.getDestination().connect(this.destination)
            }
        } else {
            this.source.disconnect()
            if(effect.nextEffect) {
                this.source.connect(effect.nextEffect.getSource())
            } else {
                this.source.connect(this.destination)
            }
        }

        effect.getDestination().disconnect()

        if(effect.previousEffect) {
            effect.previousEffect.nextEffect = effect.nextEffect
        }

        if(effect.nextEffect) {
            effect.nextEffect.previousEffect = effect.previousEffect
        }
        if(effect === this.effects) {
            this.effects = effect.nextEffect
        }
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}