
import Particle, {ParticleConfig} from './particle';

export default class Smoke extends Particle {
    constructor(config: ParticleConfig) {
        super(config)
        this.color = config.color
        this.width = config.width || 1
        this.height = config.height || 1
    }
}