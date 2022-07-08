import GameWorld, {GameWorldConfig} from '../game-world';
import WorldExplodeEffectModelPool from "../effects/explode/explode-effect-pool";
import ParticleHostComponent from "./entity/components/particle-host-component";
import EntityDataReceiveComponent from "../entity/components/network/entity-data-receive-component";
import EffectReceiver from "../entity/components/network/effect/effect-receiver";
import MapReceiver from "../entity/components/network/map/map-receiver";
import EntityStateReceiver from "../entity/components/network/entity/entity-state-receiver";
import PrimaryPlayerReceiver from "../entity/components/network/primary-player/primary-player-receiver";
import CollisionIgnoreListReceiver from "../entity/components/network/collisions/collision-ignore-list-receiver";
import ExplodeEffectEntityAffectController from "../effects/explode/explode-effect-entity-affect-controller";
import Player from "../player";

export default class ClientGameWorld extends GameWorld {

    public player: Player = null

    constructor(options?: GameWorldConfig) {
        super(options);

        this.addComponent(new WorldExplodeEffectModelPool())
        this.addComponent(new ExplodeEffectEntityAffectController())
        this.addComponent(new ParticleHostComponent())
        this.addComponent(new EntityDataReceiveComponent())
        this.addComponent(new EffectReceiver())
        this.addComponent(new MapReceiver())
        this.addComponent(new EntityStateReceiver())
        this.addComponent(new PrimaryPlayerReceiver())
        this.addComponent(new CollisionIgnoreListReceiver())
    }
}