import AbstractWorld, {GameWorldConfig} from '../abstract-world';
import ServerEntity from "./entity/server-entity";
import ServerPlayer from "./server-player";
import EntityDataTransmitComponent from "../entity/components/network/transmitting/entity-data-transmit-component";
import ExplodeEffectPool from "../effects/world/explode/explode-effect-pool";

export default class ServerGameWorld extends AbstractWorld<ServerEntity, ServerPlayer> {

    constructor(options: GameWorldConfig) {
        super(options);

        this.addComponent(new ExplodeEffectPool({
            damageBlocks: true,
            damageEntities: true
        }))
        this.addComponent(new EntityDataTransmitComponent())
    }
}