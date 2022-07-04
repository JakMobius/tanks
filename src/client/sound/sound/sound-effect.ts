
export default interface SoundEffect {
    previousEffect: SoundEffect | null
    nextEffect: SoundEffect | null
    getSource(): AudioNode
    getDestination(): AudioNode
}