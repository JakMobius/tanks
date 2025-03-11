import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import FireParticle from "src/client/particles/fire-particle";
import Entity from "src/utils/ecs/entity";
import SoundPrimaryComponent, { SoundSource } from "src/client/sound/sound/sound-primary-component";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import {SoundAssets} from "src/client/sound/sounds";
import {SoundType} from "src/sound/sounds";
import SoundEngine from "src/client/sound/sound-engine";

class FlameEffectSoundSource extends SoundSource {
    startSoundSource: AudioBufferSourceNode
    loopSoundSource: AudioBufferSourceNode
    startGainNode: GainNode
    loopGainNode: GainNode

    constructor(engine: SoundEngine) {
        super(engine)

        this.startSoundSource = engine.context.createBufferSource()
        this.startSoundSource.buffer = engine.soundBuffers[SoundType.FLAMETHROWER_START]

        this.loopSoundSource = engine.context.createBufferSource()
        this.loopSoundSource.buffer = engine.soundBuffers[SoundType.FLAMETHROWER_SOUND]

        this.startGainNode = new GainNode(engine.context)
        this.startGainNode.gain.value = SoundAssets.get(SoundType.FLAMETHROWER_START).volume

        this.loopGainNode = new GainNode(engine.context)
        this.loopGainNode.gain.value = SoundAssets.get(SoundType.FLAMETHROWER_SOUND).volume

        this.startSoundSource.connect(this.startGainNode)
        this.loopSoundSource.connect(this.loopGainNode)

        this.startGainNode.connect(this.filterSet.input)
        this.loopGainNode.connect(this.filterSet.input)
    }

    override start() {
        this.startSoundSource.start()
        this.loopSoundSource.start(this.startSoundSource.context.currentTime + this.startSoundSource.buffer.duration)
        return this
    }

    override stop() {
        this.startSoundSource.stop()
        this.loopSoundSource.stop()
        return this
    }
}

export default class ClientFlameEffectComponent extends EventHandlerComponent {
    isFiring: boolean = false

    soundEntity: Entity | null = null

    public particleQueue: number = 0;
    public particleFrequency: number = 20;

    constructor() {
        super();

        this.eventHandler.on("set-firing", (isFiring: boolean) => this.onFiringSet(isFiring))
        this.eventHandler.on("tick", (dt: number) => this.onTick(dt))
    }

    startSound() {
        this.soundEntity = new Entity()
        this.soundEntity.addComponent(new SoundPrimaryComponent((listener) => {
            return new FlameEffectSoundSource(listener.engine)
        }))
        this.soundEntity.addComponent(new SoundPositionComponent())
        this.entity.appendChild(this.soundEntity)
        this.soundEntity.getComponent(SoundPrimaryComponent).startAll()
    }

    stopSound() {
        this.soundEntity.removeFromParent()
    }

    onFiringSet(isFiring: boolean) {
        if (this.isFiring === isFiring) return
        this.isFiring = isFiring
        if (this.isFiring) {
            this.startSound()
        } else {
            this.stopSound()
        }
    }

    onTick(dt: number) {
        if (!this.isFiring) return

        const tank = this.entity.parent
        const body = tank.getComponent(PhysicalComponent).getBody()
        const transformComponent = tank.getComponent(TransformComponent)
        const transform = transformComponent.getGlobalTransform()
        const angle = transformComponent.getAngle()

        this.soundEntity?.getComponent(SoundPositionComponent).setPosition(transformComponent.getPosition())

        const velocity = body.GetLinearVelocity()

        this.particleQueue += dt * this.particleFrequency

        const world = tank.parent
        const particleComponent = world.getComponent(ParticleHostComponent)

        const particlePositionX = transform.transformX(2.5, 0)
        const particlePositionY = transform.transformY(2.5, 0)

        while (this.particleQueue > 0) {
            const heading = angle + (Math.random() - 0.5) * Math.PI / 4;
            const vx = Math.cos(heading);
            const vy = -Math.sin(heading);
            const vel = 60 + Math.random() * 5;
            const dist = Math.random() * 6;

            const smoke = new FireParticle({
                x: particlePositionX + vx * dist,
                y: particlePositionY + vy * dist,
                dx: velocity.x + vx * vel,
                dy: velocity.y + vy * vel,
                width: 1,
                height: 1,
                scaling: 15,
                lifetime: 0.4 + Math.random() * 0.1,
            });
            particleComponent.addParticle(smoke)
            this.particleQueue -= 1
        }
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);

        if(this.soundEntity) {
            this.entity.appendChild(this.soundEntity)
        }
    }

    onDetach() {
        super.onDetach();

        this.soundEntity?.removeFromParent()
    }
}