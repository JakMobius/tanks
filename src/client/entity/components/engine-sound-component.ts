import SoundPrimaryComponent from "../../sound/sound/sound-primary-component";
import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import TransformComponent from "../../../entity/components/transform-component";
import SoundHostComponent from "./sound-host-component";
import {SoundAsset} from "../../sound/sounds";
import HealthComponent from "../../../entity/components/health-component";
import WheeledTankBehaviour from "../../../entity/tanks/physics/wheeled-tank/wheeled-tank-behaviour";
import TankControls from "../../../controls/tank-controls";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import SoundTransformComponent from "../../sound/sound/sound-transform-component";

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
	public rpm: number;
	public gear: number;
    private soundHost: SoundHostComponent | null = null
    private destinationRPM: number = 0
    private eventListener: BasicEventHandlerSet = new BasicEventHandlerSet()

    constructor(config: EngineConfig) {
        this.config = Object.assign({
            multiplier: 11,
            gears: [{gearing: 1}],
            pitch: 1,
            volume: 1
        }, config)

        this.eventListener.on("attached-to-parent", (child, parent) => {
            if(!this.soundHost) this.findHostComponent(parent)
        })

        this.eventListener.on("tick", () => {
            this.tick()
        })
    }

    destroy() {
        if(this.sound) this.sound.getComponent(SoundPrimaryComponent).stop()
    }

    tick() {
        let health = this.entity.getComponent(HealthComponent).getHealth()
        let behaviour = this.entity.getComponent(WheeledTankBehaviour)
        let controls = this.entity.getComponent(TankControls)

        const clutch = Math.min(Math.abs(controls.getThrottle()) * 10, 1.0);

        if(this.sound) {
            // this.sound.config.mapX = position.x
            // this.sound.config.mapY = position.y
        }
        if(health === 0) {
            this.destinationRPM = 0
            // this.sound.gainNode.gain.value
        } else {
            const tankSpeed = behaviour.getDrivetrainSpeed()

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

            const minRPM = 1 - behaviour.enginePower

            this.destinationRPM = (Math.max(minRPM, rpm) * this.config.gears[this.gear].gearing) * clutch + (1 - clutch)
        }

        if(this.destinationRPM < this.rpm) {
            this.rpm -= 0.1
            if(this.destinationRPM > this.rpm) {
                this.rpm = this.destinationRPM
            }
        } else if(this.destinationRPM > this.rpm) {
            this.rpm += 0.05
            if(this.destinationRPM < this.rpm) {
                this.rpm = this.destinationRPM
            }
        }

        if(this.sound) {
            // this.sound.source.playbackRate.value = this.rpm * this.config.pitch
            let volume = 0.3 + clutch / 4;
            if(this.rpm < 0.7) {
                volume *= (this.rpm - 0.2) * 2
            }
            // this.sound.config.volume = volume * this.config.volume
            // this.game.updateSoundPosition(this.sound)
        }
    }

    private findHostComponent(entity: Entity) {
        while(entity) {
            let component = entity.getComponent(SoundHostComponent)
            if(component) {
                this.soundHost = component
                this.startSound();
                return;
            }
            entity = entity.parent
        }
    }

    startSound() {
        let transformComponent = this.entity.getComponent(TransformComponent)

        this.sound = SoundPrimaryComponent.createSound(this.config.sound.buffer)
        this.soundHost.engine.addSound(this.sound)

        this.sound.getComponent(SoundPrimaryComponent).loop(true)
        this.sound.addComponent(new SoundTransformComponent(transformComponent))

        this.sound.getComponent(SoundPrimaryComponent).play();

        this.rpm = 1
        this.gear = 0
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventListener.setTarget(entity)
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