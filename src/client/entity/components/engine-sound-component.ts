import SoundPrimaryComponent from "src/client/sound/sound/sound-primary-component";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "src/entity/components/transform-component";
import {SoundAsset} from "src/client/sound/sounds";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TankEngineUnit from "src/entity/components/transmission/units/tank-engine-unit";
import {siValueFromRPM} from "src/utils/utils";
import SoundBufferComponent from "src/client/sound/sound/sound-buffer-component";

export interface EngineConfig {
    sound: SoundAsset,
    recordedSpeed?: number,
    volume?: number,
    engine?: TankEngineUnit
}

export default class EngineSoundComponent extends EventHandlerComponent {
    public config: EngineConfig;
    public sound: Entity;
    private soundPosition: SoundPositionComponent | null = null
    private currentVolume = 0

    engine: TankEngineUnit

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

        this.eventHandler.on("detached-from-parent", (entity) => {
            if (entity == this.entity) {
                this.destroy()
            }
        })
    }

    destroy() {
        if (this.sound) {
            this.sound.getComponent(SoundBufferComponent).stop()
        }
    }

    tick() {
        if (!this.sound || !this.engine) {
            return;
        }

        let rpm = this.engine.getFlywheelRotationSpeed()
        let throttle = this.engine.getActualEngineThrottle()

        this.sound.getComponent(SoundBufferComponent).setPlaybackRate(rpm / this.config.recordedSpeed)

        let targetVolume = 0.3 + throttle * 0.7
        this.currentVolume = this.currentVolume * 0.8 + targetVolume * 0.2

        this.sound.getComponent(SoundPrimaryComponent).setVolume(this.currentVolume)

        let tankTransform = this.entity.getComponent(TransformComponent)
        this.soundPosition.setPosition(tankTransform.getPosition())
    }

    startSound() {
        if (!this.config.sound.engine) return

        let transformComponent = this.entity.getComponent(TransformComponent)

        this.sound = SoundBufferComponent.createSoundFromBuffer(this.config.sound)
        this.soundPosition = new SoundPositionComponent(transformComponent.getPosition())

        this.sound.addComponent(this.soundPosition)
        this.sound.getComponent(SoundBufferComponent).setLoop(true).play();
        this.entity.appendChild(this.sound)
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)
        this.startSound()
    }

    onDetach(): void {
        super.onDetach()
        if (this.sound) {
            this.sound.getComponent(SoundBufferComponent).stop()
            this.sound = null
        }
    }
}