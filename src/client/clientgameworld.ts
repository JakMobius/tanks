
import GameWorld, {GameWorldConfig} from '../gameworld';
import Particle from "./particles/particle";
import Player from "../utils/player";
import ClientEntity from "./entity/cliententity";
import ClientEffect from "./effects/clienteffect";
import GameMap from "../utils/map/gamemap";
import ClientPlayer from "./client-player";

export default class ClientGameWorld<T extends GameMap = GameMap> extends GameWorld<T, ClientEntity, ClientEffect, ClientPlayer> {

    public player: ClientPlayer = null
    public particles: Particle[] = []

    constructor(options: GameWorldConfig<T>) {
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