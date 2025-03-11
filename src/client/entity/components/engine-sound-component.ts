import SoundPrimaryComponent, { BufferSoundSource } from "src/client/sound/sound/sound-primary-component";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "src/entity/components/transform/transform-component";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TankEngineUnit from "src/entity/components/transmission/units/tank-engine-unit";
import {siValueFromRPM} from "src/utils/utils";
import { SoundType } from "src/sound/sounds";

export interface EngineConfig {
    sound: SoundType,
    recordedSpeed?: number,
    volume?: number,
    engine?: TankEngineUnit
}

export default class EngineSoundComponent extends EventHandlerComponent {
    public config: EngineConfig;
    public soundEntity: Entity;
    private soundPosition: SoundPositionComponent | null = null
    private currentVolume = 0
    private engine: TankEngineUnit

    constructor(config: EngineConfig) {
        super()
        this.config = Object.assign({
            recordedSpeed: siValueFromRPM(700),
            volume: 1
        }, config)

        this.engine = config.engine

        this.eventHandler.on("tick", () => {
            this.tick()
        })
    }

    tick() {
        if (!this.soundEntity || !this.engine) {
            return;
        }

        let rpm = this.engine.getFlywheelRotationSpeed()
        let throttle = this.engine.getActualEngineThrottle()

        for(let source of this.soundEntity.getComponent(SoundPrimaryComponent).soundSources.values()) {
            if(source instanceof BufferSoundSource) {
                source.bufferSource.playbackRate.value = rpm / this.config.recordedSpeed
            }
        }

        let targetVolume = 0.3 + throttle * 0.7
        this.currentVolume = this.currentVolume * 0.8 + targetVolume * 0.2

        this.soundEntity.getComponent(SoundPrimaryComponent).setVolume(this.currentVolume)

        let tankTransform = this.entity.getComponent(TransformComponent)
        this.soundPosition.setPosition(tankTransform.getPosition())
    }

    startSound() {
        let transformComponent = this.entity.getComponent(TransformComponent)

        this.soundEntity = new Entity()

        let soundPrimaryComponent = new SoundPrimaryComponent((listener) => {
            return new BufferSoundSource(listener.engine, this.config.sound)
                .setLoop(true)
                .start()
        })

        this.soundPosition = new SoundPositionComponent(transformComponent.getPosition())
        this.soundEntity.addComponent(soundPrimaryComponent)
        this.soundEntity.addComponent(this.soundPosition)

        this.entity.appendChild(this.soundEntity)
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)
        this.startSound()
    }

    onDetach(): void {
        super.onDetach()

        if (!this.soundEntity) return
        this.soundEntity.getComponent(SoundPrimaryComponent).stopAll()
        this.soundEntity = null
    }
}