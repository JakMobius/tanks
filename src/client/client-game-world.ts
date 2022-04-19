import AbstractWorld, {GameWorldConfig} from '../abstract-world';
import ClientEntity from "./entity/client-entity";
import ClientPlayer from "./client-player";
import ClientTank from "./entity/tank/client-tank";
import WorldExplodeEffectModelPool from "../effects/world/explode/explode-effect-pool";
import ParticleHost from "./particle-host";

export default class ClientGameWorld extends AbstractWorld<ClientEntity, ClientPlayer> {

    public player: ClientPlayer = null

    constructor(options?: GameWorldConfig) {
        super(options);

        this.addComponent(new WorldExplodeEffectModelPool())
        this.addComponent(new ParticleHost())
    }

    public tick(dt: number): void {
        super.tick(dt)
    }

    setPrimaryPlayer(player: ClientPlayer) {
        this.player = player
        this.emit("primary-player-set", player)
    }
}