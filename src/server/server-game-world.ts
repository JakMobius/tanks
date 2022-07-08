import GameWorld, {GameWorldConfig} from '../game-world';
import ExplodeEffectPool from "../effects/explode/explode-effect-pool";
import ServerEntityDataTransmitComponent from "./entity/server-entity-data-transmit-component";
import ExplodeEffectEntityAffectController from "../effects/explode/explode-effect-entity-affect-controller";

export default class ServerGameWorld extends GameWorld {

    constructor(options: GameWorldConfig) {
        super(options);

        this.addComponent(new ServerEntityDataTransmitComponent())
        this.addComponent(new ExplodeEffectPool({
            damageBlocks: true
        }))
        this.addComponent(new ExplodeEffectEntityAffectController({
            damageEntities: true
        }))
    }
}