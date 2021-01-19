
import Particle, {ParticleConfig} from './particle';

class Smoke extends Particle {
    constructor(config: ParticleConfig) {
        super(config)
        this.color = config.color
        this.width = config.width || 4
        this.height = config.height || 4
    }
}

export default Smoke;