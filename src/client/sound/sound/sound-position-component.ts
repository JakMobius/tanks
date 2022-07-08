import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import SoundEffect from "./sound-effect";
import SoundEngine from "../sound-engine";
import {SoundStream} from "../stream/sound-stream";
import SoundPrimaryComponent from "./sound-primary-component";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import * as Box2D from "../../../library/box2d"

class StreamPositionFilters extends SoundEffect {
    panFilter: PannerNode
    biquadFilter: BiquadFilterNode

    // TODO: remove
    engineStream: SoundStream

    constructor(engine: SoundEngine, stream: SoundStream, engineStream: SoundStream) {
        super(stream)

        this.engineStream = engineStream

        this.panFilter = engine.context.createPanner();
        this.biquadFilter = engine.context.createBiquadFilter();
        this.biquadFilter.type = "lowpass";

        this.panFilter.connect(this.biquadFilter);
    }

    getOutput(): AudioNode {
        return this.biquadFilter;
    }

    getInput(): AudioNode {
        return this.panFilter;
    }
}

export default class SoundPositionComponent implements Component {

    position: Box2D.XY = {x: 0, y: 0}
    entity: Entity | null;

    private filters: StreamPositionFilters[] = []
    private eventHandler = new BasicEventHandlerSet()

    constructor(position: Box2D.XY) {
        this.position = { x: position.x, y: position.y }
        this.eventHandler.on("tick", () => this.updatePosition())
    }

    setPosition(position: Box2D.XY) {
        this.position.x = position.x
        this.position.y = position.y
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
        this.createFilters()
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(null)
        this.destroyFilters()
    }

    updatePosition() {

        for(let filter of this.filters) {

            if(!filter.engineStream || !filter.engineStream.position || !filter.engineStream.position.position) {
                filter.ensureDisconnected()
                continue
            }

            filter.ensureConnected()

            const offsetX = this.position.x - filter.engineStream.position.position.x
            const offsetY = this.position.y - filter.engineStream.position.position.y

            const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)

            filter.panFilter.positionX.value = offsetX
            filter.panFilter.positionY.value = offsetY
            filter.panFilter.positionZ.value = 20
            filter.panFilter.rolloffFactor = 1/20

            const freq = 25000 / (distance + 10) * 10;

            filter.biquadFilter.frequency.value = Math.max(0, Math.min(freq, filter.biquadFilter.frequency.maxValue))
        }
    }

    private createFilters() {
        let soundPrimaryComponent = this.entity.getComponent(SoundPrimaryComponent)
        let engine = soundPrimaryComponent.asset.engine
        let outputs = soundPrimaryComponent.outputStreams

        // Create filters for each output stream
        // TODO: It seems wrong to pass an engine output, but it's the only way to get the ear position for now
        for(let i = 0; i < outputs.length; i++) {
            this.filters.push(new StreamPositionFilters(engine, outputs[i], engine.outputs[i]))
        }
    }

    private destroyFilters() {
        for(let filter of this.filters) {
            filter.ensureDisconnected()
        }
    }
}