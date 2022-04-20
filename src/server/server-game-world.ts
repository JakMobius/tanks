import AbstractWorld, {GameWorldConfig} from '../abstract-world';
import ServerEntity from "./entity/server-entity";
import ServerPlayer from "./server-player";
import EntityDataTransmitComponent from "../entity/components/network/entity-data-transmit-component";
import EffectTransmitterComponent from "../entity/components/network/effect/effect-transmitter-component";
import ExplodeEffectPool from "../effects/world/explode/explode-effect-pool";
import MapTransmitterComponent from "../entity/components/network/map/map-transmitter-component";

export default class ServerGameWorld extends AbstractWorld<ServerEntity, ServerPlayer> {

    constructor(options: GameWorldConfig) {
        super(options);

        this.addComponent(new ExplodeEffectPool({
            damageBlocks: true,
            damageEntities: true
        }))
        this.addComponent(new EntityDataTransmitComponent())
        this.addComponent(new EffectTransmitterComponent())
        this.addComponent(new MapTransmitterComponent())
    }
}