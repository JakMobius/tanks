
import GameWorld, {GameWorldConfig} from '../gameworld';
import Particle from "./particles/particle";
import Player from "../utils/player";
import ClientEntity from "./entity/cliententity";
import ClientEffect from "./effects/clienteffect";

class ClientGameWorld extends GameWorld {

    public player: Player = null
    public particles: Particle[] = []

    //public entities: Map<number, ClientEntity>
    //public effects: Map<number, ClientEffect>

    constructor(options: GameWorldConfig) {
        super(options);
    }

    private processParticles(dt: number): void {
        for(let i = 0, l = this.particles.length; i < l; i++) {
            let p = this.particles[i]

            p.tick(dt)

            if(p.dead) {
                this.particles.splice(i--, 1)
                l--
            }
        }
    }

    public tick(dt: number): void {
        super.tick(dt)
        this.processParticles(dt)
    }
}

export default ClientGameWorld;