import GameWorld, {GameWorldConfig} from '../game-world';
import ClientPlayer from "./client-player";
import WorldExplodeEffectModelPool from "../effects/explode/explode-effect-pool";
import ParticleHost from "./particle-host";
import EntityDataReceiveComponent from "../entity/components/network/entity-data-receive-component";
import EffectReceiver from "../entity/components/network/effect/effect-receiver";
import MapReceiver from "../entity/components/network/map/map-receiver";
import EntityStateReceiver from "../entity/components/network/entity/entity-state-receiver";
import PrimaryPlayerReceiver from "../entity/components/network/primary-player/primary-player-receiver";
import CollisionIgnoreListReceiver from "../entity/components/network/collisions/collision-ignore-list-receiver";
import ExplodeEffectEntityAffectController from "../effects/explode/explode-effect-entity-affect-controller";

export default class ClientGameWorld extends GameWorld {

    public player: ClientPlayer = null

    constructor(options?: GameWorldConfig) {
        super(options);

        this.addComponent(new WorldExplodeEffectModelPool())
        this.addComponent(new ExplodeEffectEntityAffectController())
        this.addComponent(new ParticleHost())
        this.addComponent(new EntityDataReceiveComponent())
        this.addComponent(new EffectReceiver())
        this.addComponent(new MapReceiver())
        this.addComponent(new EntityStateReceiver())
        this.addComponent(new PrimaryPlayerReceiver())
        this.addComponent(new CollisionIgnoreListReceiver())
    }
}