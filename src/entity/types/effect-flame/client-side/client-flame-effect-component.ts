import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform-component";
import FireParticle from "src/client/particles/fire-particle";
import Entity from "src/utils/ecs/entity";
import SoundPrimaryComponent from "src/client/sound/sound/sound-primary-component";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import {SoundAssets} from "src/client/sound/sounds";
import {SoundType} from "src/sound/sounds";

export default class ClientFlameEffectComponent extends EventHandlerComponent {
    isFiring: boolean = false

    soundEffect: Entity | null = null

    startSoundNode: AudioBufferSourceNode
    startSoundGain: GainNode

    loopSoundNode: AudioBufferSourceNode
    loopSoundGain: GainNode

    public particleQueue: number = 0;
    public particleFrequency: number = 20;

    constructor() {
        super();

        this.eventHandler.on("set-firing", (isFiring: boolean) => this.onFiringSet(isFiring))
        this.eventHandler.on("tick", (dt: number) => this.onTick(dt))

        this.setupSound()
    }

    setupSound() {
        this.startSoundGain = SoundAssets[SoundType.FLAMETHROWER_START].createGainNode()
        this.loopSoundGain = SoundAssets[SoundType.FLAMETHROWER_SOUND].createGainNode()

        if (this.startSoundGain && this.loopSoundGain) {
            this.soundEffect = new Entity()

            let resultSoundNode = new GainNode(this.startSoundGain?.context)

            this.startSoundGain.connect(resultSoundNode)
            this.loopSoundGain.connect(resultSoundNode)

            this.soundEffect.addComponent(new SoundPrimaryComponent().setSource(resultSoundNode))
            this.soundEffect.addComponent(new SoundPositionComponent())
        }
    }

    startSound() {
        this.startSoundNode?.disconnect()
        this.loopSoundNode?.disconnect()

        this.startSoundNode = SoundAssets[SoundType.FLAMETHROWER_START].createBufferSource()
        this.loopSoundNode = SoundAssets[SoundType.FLAMETHROWER_SOUND].createBufferSource()

        if (this.startSoundNode && this.loopSoundNode) {
            this.startSoundNode.connect(this.startSoundGain)
            this.loopSoundNode.connect(this.loopSoundGain)
            this.loopSoundNode.loop = true

            this.startSoundNode.start()
            this.loopSoundNode.start(this.startSoundNode.context.currentTime + this.loopSoundNode.buffer.duration)
        }
    }

    stopSound() {
        if (!this.startSoundNode) return
        this.startSoundNode.stop()
        this.loopSoundNode.stop()
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
        const transform = transformComponent.transform

        this.soundEffect?.getComponent(SoundPositionComponent).setPosition(transformComponent.getPosition())

        const velocity = body.GetLinearVelocity()
        const angle = body.GetAngle()

        this.particleQueue += dt * this.particleFrequency

        const world = tank.parent
        const particleComponent = world.getComponent(ParticleHostComponent)

        const particlePositionX = transform.transformX(0, 2.5)
        const particlePositionY = transform.transformY(0, 2.5)

        while (this.particleQueue > 0) {
            const heading = -angle + (Math.random() - 0.5) * Math.PI / 4;
            const sin = Math.sin(heading);
            const cos = Math.cos(heading);
            const vel = 60 + Math.random() * 5;
            const dist = Math.random() * 6;

            const smoke = new FireParticle({
                x: particlePositionX + sin * dist,
                y: particlePositionY + cos * dist,
                dx: velocity.x + sin * vel,
                dy: velocity.y + cos * vel,
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

        if(this.soundEffect) {
            this.entity.appendChild(this.soundEffect)
        }
    }

    onDetach() {
        super.onDetach();

        this.soundEffect?.removeFromParent()
    }
}