import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import TransformComponent from "../../../entity/components/transform-component";
import SoundEffect from "./sound-effect";
import SoundEngine from "../sound-engine";
import {SoundStreamPrimaryComponent} from "../stream/sound-stream-primary-component";
import SoundPrimaryComponent from "./sound-primary-component";
import {SoundStreamPositionComponent} from "../stream/sound-stream-position-component";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";

export class StreamPositionFilters implements SoundEffect {
    panFilter: PannerNode
    biquadFilter: BiquadFilterNode

    nextEffect: SoundEffect | null;
    previousEffect: SoundEffect | null;

    connected = false

    output: Entity

    constructor(engine: SoundEngine, output: Entity) {
        this.output = output

        this.panFilter = engine.context.createPanner();
        this.biquadFilter = engine.context.createBiquadFilter();
        this.biquadFilter.type = "lowpass";

        this.panFilter.connect(this.biquadFilter);
    }

    ensureConnected() {
        if(!this.connected) {
            this.output.getComponent(SoundStreamPrimaryComponent).addEffect(this)
            this.connected = true
        }
    }

    ensureDisconnected() {
        if(this.connected) {
            this.output.getComponent(SoundStreamPrimaryComponent).removeEffect(this)
            this.connected = false
        }
    }

    getDestination(): AudioNode {
        return this.biquadFilter;
    }

    getSource(): AudioNode {
        return this.panFilter;
    }
}

export default class SoundTransformComponent implements Component {

    transform: TransformComponent
    entity: Entity | null;

    private filters: StreamPositionFilters[] = []
    private soundEngineEventHandler = new BasicEventHandlerSet()

    constructor(transformComponent: TransformComponent) {
        this.transform = transformComponent

        this.soundEngineEventHandler.on("tick", () => this.updatePosition())
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.soundEngineEventHandler.setTarget(this.entity.getComponent(SoundPrimaryComponent).engine)
        this.createFilters()
    }

    onDetach(): void {
        this.entity = null
        this.soundEngineEventHandler.setTarget(null)
        this.destroyFilters()
    }

    updatePosition() {
        const soundPosition = this.transform.getPosition()
        if(!soundPosition) return

        for(let filter of this.filters) {
            const streamPositionComponent = filter.output.getComponent(SoundStreamPositionComponent)
            if(!streamPositionComponent || !streamPositionComponent.position) {
                filter.ensureDisconnected()
                continue
            }

            filter.ensureConnected()

            const offsetX = soundPosition.x - streamPositionComponent.position.x
            const offsetY = soundPosition.y - streamPositionComponent.position.y

            const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)

            filter.panFilter.positionX.value = offsetX
            filter.panFilter.positionY.value = offsetY
            filter.panFilter.positionY.value = 20
            filter.panFilter.rolloffFactor = 1/20

            const freq = 25000 / (distance + 10) * 10;

            filter.biquadFilter.frequency.value = Math.max(0, Math.min(freq, filter.biquadFilter.frequency.maxValue))
        }
    }

    private createFilters() {
        let soundPrimaryComponent = this.entity.getComponent(SoundPrimaryComponent)
        let outputStreams = soundPrimaryComponent.outputStreams
        let engine = soundPrimaryComponent.engine

        this.filters = outputStreams.map(output => new StreamPositionFilters(engine, output))
    }

    private destroyFilters() {
        for(let filter of this.filters) {
            filter.ensureDisconnected()
        }
    }
}