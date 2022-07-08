import SoundEffect from "../sound/sound-effect";
import SoundEngine from "../sound-engine";
import {SoundStreamPosition} from "./sound-stream-position-component";

export class SoundStream {
    public input: GainNode
    public output: GainNode
    public position: SoundStreamPosition | null = null
    private effects: SoundEffect | null = null

    constructor(engine: SoundEngine) {
        this.input = new GainNode(engine.context)
        this.output = new GainNode(engine.context)

        this.input.connect(this.output)
    }

    addEffect(effect: SoundEffect) {
        effect.previousEffect = this.effects
        effect.nextEffect = null
        if(this.effects) {
            this.effects.nextEffect = effect
            this.effects = effect
        }

        if(effect.previousEffect) {
            effect.previousEffect.getOutput().disconnect()
            effect.previousEffect.getOutput().connect(effect.getInput())
        } else {
            this.input.disconnect()
            this.input.connect(effect.getInput())
        }
        effect.getOutput().connect(this.output)
    }

    removeEffect(effect: SoundEffect) {

        if(effect.previousEffect) {
            effect.previousEffect.getOutput().disconnect()
            if(effect.nextEffect) {
                effect.previousEffect.getOutput().connect(effect.nextEffect.getInput())
            } else {
                effect.previousEffect.getOutput().connect(this.output)
            }
        } else {
            this.input.disconnect()
            if(effect.nextEffect) {
                this.input.connect(effect.nextEffect.getInput())
            } else {
                this.input.connect(this.output)
            }
        }

        effect.getOutput().disconnect()

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
}