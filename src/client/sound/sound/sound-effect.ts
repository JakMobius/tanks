
export default abstract class SoundEffect {

    abstract getInput(): AudioNode
    abstract getOutput(): AudioNode

    context: BaseAudioContext

    protected constructor(context: BaseAudioContext) {
        this.context = context
    }
}