
import AbstractWorld, {GameWorldConfig} from '../abstract-world';
import Particle from "./particles/particle";
import ClientEntity from "./entity/client-entity";
import ClientEffect from "./effects/client-effect";
import GameMap from "../map/gamemap";
import ClientPlayer from "./client-player";
import ClientTank from "./entity/tank/client-tank";

export default class ClientGameWorld<T extends GameMap = GameMap> extends AbstractWorld<T, ClientEntity, ClientEffect, ClientPlayer, ClientTank> {

    public player: ClientPlayer = null
    public particles: Particle[] = []

    constructor(options?: GameWorldConfig<T>) {
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

    setPrimaryPlayer(player: ClientPlayer) {
        this.player = player
        this.emit("primary-player-set", player)
    }
}