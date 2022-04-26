import GameWorld, {GameWorldConfig} from '../game-world';
import EntityDataTransmitComponent from "../entity/components/network/transmitting/entity-data-transmit-component";
import ExplodeEffectPool from "../effects/world/explode/explode-effect-pool";

export default class ServerGameWorld extends GameWorld {

    constructor(options: GameWorldConfig) {
        super(options);

        this.addComponent(new ExplodeEffectPool({
            damageBlocks: true,
            damageEntities: true
        }))
        this.addComponent(new EntityDataTransmitComponent())
    }
}