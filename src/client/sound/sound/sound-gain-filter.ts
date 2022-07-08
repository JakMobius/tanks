import SoundEffect from "./sound-effect";
import SoundEngine from "../sound-engine";
import {SoundStream} from "../stream/sound-stream";

export default class SoundGainFilter extends SoundEffect {
    node: GainNode

    constructor(engine: SoundEngine, output: SoundStream) {
        super(output)

        this.node = engine.context.createGain();
    }

    getOutput(): AudioNode {
        return this.node;
    }

    getInput(): AudioNode {
        return this.node;
    }
}