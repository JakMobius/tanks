import GameWorld, {GameWorldConfig} from '../game-world';
import EntityDataTransmitComponent from "../entity/components/network/transmitting/entity-data-transmit-component";
import ExplodeEffectPool from "../effects/explode/explode-effect-pool";
import ServerEntityDataTransmitComponent from "./entity/server-entity-data-transmit-component";

export default class ServerGameWorld extends GameWorld {

    constructor(options: GameWorldConfig) {
        super(options);

        this.addComponent(new ServerEntityDataTransmitComponent())
        this.addComponent(new ExplodeEffectPool({
            damageBlocks: true,
            damageEntities: true
        }))
    }
}