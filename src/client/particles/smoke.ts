
import Particle, {ParticleConfig} from './particle';

export default class Smoke extends Particle {
	public scaling: any;

    constructor(config: ParticleConfig) {
        super(config)
        this.color = config.color
        this.width = config.width || 4
        this.height = config.height || 4
        this.scaling = config.scaling === undefined ? 0.01 : config.scaling
    }

    tick(dt: number) {
        super.tick(dt)

        this.color.setAlpha(1 - this.lifespan / this.lifetime)

    }
}