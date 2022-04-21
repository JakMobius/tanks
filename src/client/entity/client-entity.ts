import AbstractEntity from '../../entity/abstract-entity';
import EntityModel from '../../entity/entity-model';
import {Constructor} from "../../serialization/binary/serializable";
import ServerPosition from "./server-position";
import EntityDataDecoder from "./entity-data-decoder";
import EntityDataReceiveComponent from "../../entity/components/network/entity-data-receive-component";
import EffectReceiver from "../../entity/components/network/effect/effect-receiver";
import PositionReceiver from "../../entity/components/network/position/position-receiver";
import HealthReceiver from "../../entity/components/network/health/health-receiver";
import EntityStateReceiver from "../../entity/components/network/entity/entity-state-receiver";

export const EntityType = {
    BULLET_16MM:          0x0100,
    BULLET_42MM:          0x0101,
    BULLET_BOMB:          0x0102,
    BULLET_CANNONBALL:    0x0103,
    BULLET_MINE:          0x0104,
    TANK_BIGBOI:          0x0200,
    TANK_BOMBER:          0x0201,
    TANK_MONSTER:         0x0202,
    TANK_NASTY:           0x0203,
    TANK_SNIPER:          0x0204,
}

export default class ClientEntity extends AbstractEntity {

	static types = new Map<number, (model: EntityModel) => void>()

    constructor(model: EntityModel) {
        super(model);

        ClientEntity.configureEntity(model)
    }

    static configureEntity(model: EntityModel) {
        model.addComponent(new ServerPosition())
        model.addComponent(new EntityDataDecoder())

        model.addComponent(new EntityStateReceiver())
        model.addComponent(new EffectReceiver())
        model.addComponent(new PositionReceiver())
        model.addComponent(new HealthReceiver())
    }

    static associate(type: number, configureFunction: (model: EntityModel) => void) {
        this.types.set(type, configureFunction)
    }
}