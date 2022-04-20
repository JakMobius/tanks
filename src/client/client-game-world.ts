import AbstractWorld, {GameWorldConfig} from '../abstract-world';
import ClientEntity from "./entity/client-entity";
import ClientPlayer from "./client-player";
import WorldExplodeEffectModelPool from "../effects/world/explode/explode-effect-pool";
import ParticleHost from "./particle-host";
import EntityDataReceiveComponent from "../entity/components/network/entity-data-receive-component";
import EffectReceiverComponent from "../entity/components/network/effect/effect-receiver-component";
import MapReceiverComponent from "../entity/components/network/map/map-receiver-component";

export default class ClientGameWorld extends AbstractWorld<ClientEntity, ClientPlayer> {

    public player: ClientPlayer = null

    constructor(options?: GameWorldConfig) {
        super(options);

        this.addComponent(new WorldExplodeEffectModelPool())
        this.addComponent(new ParticleHost())
        this.addComponent(new EntityDataReceiveComponent(null))
        this.addComponent(new EffectReceiverComponent())
        this.addComponent(new MapReceiverComponent())
    }

    public tick(dt: number): void {
        super.tick(dt)
    }

    setPrimaryPlayer(player: ClientPlayer) {
        this.player = player
        this.emit("primary-player-set", player)
    }
}