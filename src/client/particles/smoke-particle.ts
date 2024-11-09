import Particle, {ParticleConfig} from './particle';

export default class SmokeParticle extends Particle {
	public scaling: number;
    public alpha: number

    constructor(config: ParticleConfig) {
        super(config)
        this.color = config.color
        this.width = config.width || 1
        this.height = config.height || 1
        this.scaling = config.scaling === undefined ? 0.01 : config.scaling
        this.alpha = config.color.getAlpha()
    }

    tick(dt: number) {
        super.tick(dt)

        this.color.setAlpha(this.alpha * (1 - this.lifespan / this.lifetime))
    }
}