import SoundFilter from "./sound-effect";
import SoundEngine from "../sound-engine";
import {SoundStream} from "../stream/sound-stream";
import SoundPrimaryComponent from "./sound-primary-component";
import * as Box2D from "@box2d/core"
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import CameraComponent from "src/client/graphics/camera";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";

class SoundPositionFilter extends SoundFilter {
    panFilter: PannerNode
    biquadFilter: BiquadFilterNode

    constructor(context: BaseAudioContext) {
        super(context)

        this.panFilter = context.createPanner();
        this.biquadFilter = context.createBiquadFilter();
        this.biquadFilter.type = "lowpass";

        this.panFilter.connect(this.biquadFilter);
    }

    getOutput(): AudioNode {
        return this.biquadFilter;
    }

    getInput(): AudioNode {
        return this.panFilter;
    }

    setPassthrough() {
        this.panFilter.positionX.value = 0
        this.panFilter.positionY.value = 0
        this.panFilter.positionZ.value = 20
        this.panFilter.rolloffFactor = 1 / 20

        this.biquadFilter.frequency.value = 24000
    }
}

export default class SoundPositionComponent extends EventHandlerComponent {

    position: Box2D.XY | null = null
    private filters = new Map<Entity, SoundPositionFilter>()

    constructor(position: Box2D.XY | null = null) {
        super()
        this.position = position
        this.eventHandler.on("tick", () => this.onTick())
        this.eventHandler.on("camera-attach", (camera: Entity) => this.onCameraAttach(camera))
        this.eventHandler.on("camera-detach", (camera: Entity) => this.onCameraDetach(camera))
    }

    setPosition(position: Box2D.XY | null) {
        this.position = position
        return this
    }

    onTick() {
        for (let [camera, filter] of this.filters.entries()) {
            this.updateSoundFilters(camera, filter)
        }
    }

    updateSoundFilters(camera: Entity, filter: SoundPositionFilter) {
        if (!this.position) {
            filter.setPassthrough()
            return
        }

        let cameraComponent = camera.getComponent(CameraComponent)

        let centerX = cameraComponent.inverseMatrix.transformX(0, 0)
        let centerY = cameraComponent.inverseMatrix.transformY(0, 0)

        const offsetX = this.position.x - centerX
        const offsetY = this.position.y - centerY

        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)

        filter.panFilter.positionX.value = offsetX
        filter.panFilter.positionY.value = offsetY
        filter.panFilter.positionZ.value = 5
        filter.panFilter.rolloffFactor = 1 / 5

        const freq = 24000 / (distance + 10) * 10;

        filter.biquadFilter.frequency.value = Math.max(0, Math.min(freq, filter.biquadFilter.frequency.maxValue))
    }

    private onCameraAttach(camera: Entity) {
        let soundPrimaryComponent = this.entity.getComponent(SoundPrimaryComponent)
        let soundStream = soundPrimaryComponent.streams.get(camera)
        let context = soundStream.context
        let filter = new SoundPositionFilter(context)

        this.updateSoundFilters(camera, filter)

        this.filters.set(camera, filter)
        soundStream?.addFilter(filter)
    }

    private onCameraDetach(camera: Entity) {
        let soundPrimaryComponent = this.entity.getComponent(SoundPrimaryComponent)
        let filter = this.filters.get(camera)

        this.filters.delete(camera)
        soundPrimaryComponent.streams.get(camera)?.removeFilter(filter)
    }
}