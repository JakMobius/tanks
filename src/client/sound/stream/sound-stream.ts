import SoundEffect from "../sound/sound-effect";
import SoundEngine from "../sound-engine";
import {SoundStreamPosition} from "./sound-stream-position-component";
import LinkedList from "src/utils/linked-list";

export class SoundStream {
    public input: GainNode
    public output: GainNode
    public context: BaseAudioContext
    private effects = new LinkedList<SoundEffect>()

    constructor(context: BaseAudioContext) {
        this.context = context
        this.input = new GainNode(context)
        this.output = new GainNode(context)

        this.input.connect(this.output)
    }

    addFilter(effect: SoundEffect) {
        let previous = this.effects.getTail()
        this.effects.insertTail(effect)

        if (previous) {
            previous.getOutput().disconnect()
            previous.getOutput().connect(effect.getInput())
        } else {
            this.input.disconnect()
            this.input.connect(effect.getInput())
        }

        effect.getOutput().connect(this.output)
    }

    removeFilter(effect: SoundEffect) {

        let iterator = this.effects.head
        while (iterator && iterator.item !== effect) {
            iterator = iterator.next
        }

        if (!iterator) return

        if (iterator.prev) {
            iterator.prev.item.getOutput().disconnect()
            if (iterator.next) {
                iterator.prev.item.getOutput().connect(iterator.next.item.getInput())
            } else {
                iterator.prev.item.getOutput().connect(this.output)
            }
        } else {
            this.input.disconnect()
            if (iterator.next) {
                this.input.connect(iterator.next.item.getInput())
            } else {
                this.input.connect(this.output)
            }
        }

        effect.getOutput().disconnect()

        iterator.unlink()
    }
}