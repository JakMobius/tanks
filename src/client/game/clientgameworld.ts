
import GameWorld from '../../gameworld';

class ClientGameWorld extends GameWorld {

    /**
     * @type Player
     */
    player = null

    /**
     * @type Particle[]
     */
    particles = []

    constructor(options) {
        super(options);
    }

    processParticles(dt) {
        for(let i = 0, l = this.particles.length; i < l; i++) {
            let p = this.particles[i]

            p.tick(dt)

            if(p.dead) {
                this.particles.splice(i--, 1)
                l--
            }
        }
    }

    tick(dt) {
        super.tick(dt)
        this.processParticles(dt)
    }
}

export default ClientGameWorld;