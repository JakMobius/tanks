import AbstractWorld, {GameWorldConfig} from '../abstract-world';
import ClientEntity from "./entity/client-entity";
import ClientPlayer from "./client-player";
import WorldExplodeEffectModelPool from "../effects/world/explode/explode-effect-pool";
import ParticleHost from "./particle-host";
import EntityDataReceiveComponent from "../entity/components/network/entity-data-receive-component";
import EffectReceiver from "../entity/components/network/effect/effect-receiver";
import MapReceiver from "../entity/components/network/map/map-receiver";
import EntityStateReceiver from "../entity/components/network/entity/entity-state-receiver";
import PrimaryPlayerReceiver from "../entity/components/network/primary-player/primary-player-receiver";

export default class EntityClientGameWorld extends AbstractWorld<ClientEntity, ClientPlayer> {

    public player: ClientPlayer = null

    constructor(options?: GameWorldConfig) {
        super(options);

        this.addComponent(new WorldExplodeEffectModelPool())
        this.addComponent(new ParticleHost())
        this.addComponent(new EntityDataReceiveComponent())
        this.addComponent(new EffectReceiver())
        this.addComponent(new MapReceiver())
        this.addComponent(new EntityStateReceiver())
        this.addComponent(new PrimaryPlayerReceiver())
    }

    public tick(dt: number): void {
        super.tick(dt)
    }
}