import SoundPrimaryComponent from "src/client/sound/sound/sound-primary-component";
import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "src/entity/components/transform-component";
import {SoundAsset} from "src/client/sound/sounds";
import HealthComponent from "src/entity/components/health-component";
import WheeledTankBehaviour from "src/entity/tanks/physics/wheeled-tank/wheeled-tank-behaviour";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import SoundGainFilter from "src/client/sound/sound/sound-gain-filter";

export interface EngineConfig {
    sound: SoundAsset,
    gears?: EngineGearConfig[],
    multiplier: number,
    pitch: number
    volume?: number
}

export interface EngineGearConfig {
    /// When should gearbox switch to the next gear
    high?: number

    /// When should gearbox switch to the previous gear
    low?: number

    /// Gear ratio
    gearing: number
}

export default class EngineSoundComponent implements Component {
	public config: EngineConfig;
	public entity: Entity;
	public sound: Entity;
	public rpm: number = 0;
	public gear: number = 1;
    private targetRPM: number = 0
    private eventListener: BasicEventHandlerSet = new BasicEventHandlerSet()
    private gainFilter: SoundGainFilter | null = null
    private soundPosition: SoundPositionComponent | null = null

    constructor(config: EngineConfig) {
        this.config = Object.assign({
            multiplier: 3,
            gears: [{gearing: 1}],
            pitch: 1,
            volume: 1
        }, config)

        this.eventListener.on("tick", () => {
            this.tick()
        })

        this.eventListener.on("detached-from-parent", (entity) => {
            if(entity == this.entity) {
                this.sound.getComponent(SoundPrimaryComponent).disconnect()
                this.destroy()
            }
        })
    }

    destroy() {
        if(this.sound) this.sound.getComponent(SoundPrimaryComponent).stop()
    }

    tick() {
        const health = this.entity.getComponent(HealthComponent).getHealth()
        const behaviour = this.entity.getComponent(WheeledTankBehaviour)

        if(!behaviour) return;

        const minRPM = 1
        const tankSpeed = behaviour.getDrivetrainSpeed()
        const gearboxRPM = tankSpeed / this.config.multiplier;

        const clutch = Math.max(Math.min((gearboxRPM - minRPM / 2) / (minRPM / 2), 1), 0) *
                       Math.min(Math.abs(behaviour.getEngineThrottle()) * 10, 1.0);

        if(health === 0) {
            this.targetRPM = 0
            this.gainFilter.node.gain.value = 0
        } else {
            const rpm = tankSpeed / this.config.multiplier;

            const currentGear = this.config.gears[this.gear];
            const nextGear = this.config.gears[this.gear + 1];
            const previousGear = this.config.gears[this.gear - 1];

            const currentRPM = rpm * currentGear.gearing;

            if(previousGear && currentRPM < currentGear.low) {
                this.gear--
            }
            if(nextGear && currentRPM > currentGear.high) {
                this.gear++
            }

            this.targetRPM = (Math.max(minRPM, rpm) * this.config.gears[this.gear].gearing) * clutch + (1 - clutch)
        }

        if(this.targetRPM < this.rpm) {
            this.rpm -= 0.1
            if(this.targetRPM > this.rpm) {
                this.rpm = this.targetRPM
            }
        } else if(this.targetRPM > this.rpm) {
            this.rpm += 0.05
            if(this.targetRPM < this.rpm) {
                this.rpm = this.targetRPM
            }
        }

        if(this.sound) {
            this.sound.getComponent(SoundPrimaryComponent).source.playbackRate.value = this.rpm * this.config.pitch
            let volume = 0.3 + clutch / 4;
            if(this.rpm < 0.7) {
                volume *= (this.rpm - 0.2) * 2
            }
            this.gainFilter.node.gain.value = volume
            let tankTransform = this.entity.getComponent(TransformComponent)
            this.soundPosition.setPosition(tankTransform.getPosition())
        }
    }

    startSound() {
        let transformComponent = this.entity.getComponent(TransformComponent)

        this.sound = SoundPrimaryComponent.createSound(this.config.sound)
        let soundComponent = this.sound.getComponent(SoundPrimaryComponent)

        this.gainFilter = new SoundGainFilter(this.config.sound.engine, soundComponent.inputStream)
        this.gainFilter.ensureConnected()

        this.soundPosition = new SoundPositionComponent(transformComponent.getPosition())

        this.sound.addComponent(this.soundPosition)
        this.sound.getComponent(SoundPrimaryComponent).loop(true).play();

        this.rpm = 1
        this.gear = 0
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventListener.setTarget(entity)
        this.startSound()
    }

    onDetach(): void {
        this.entity = null
        this.eventListener.setTarget(null)
        if(this.sound) {
            this.sound.getComponent(SoundPrimaryComponent).stop()
            this.sound = null
        }
    }
}