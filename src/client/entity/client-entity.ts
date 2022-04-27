
import EntityModel from '../../entity/entity-model';
import ServerPosition from "./server-position";
import EffectReceiver from "../../entity/components/network/effect/effect-receiver";
import PositionReceiver from "../../entity/components/network/position/position-receiver";
import HealthReceiver from "../../entity/components/network/health/health-receiver";
import EntityStateReceiver from "../../entity/components/network/entity/entity-state-receiver";
import Entity from "../../utils/ecs/entity";
import CollisionIgnoreListReceiver from "../../entity/components/network/collisions/collision-ignore-list-receiver";

export const EntityType = {
    BULLET_16MM:          0x0100,
    BULLET_42MM:          0x0101,
    BULLET_BOMB:          0x0102,
    BULLET_CANNONBALL:    0x0103,
    BULLET_MINE:          0x0104,
    BULLET_MORTAR_BALL:   0x0105,
    TANK_BIGBOI:          0x0200,
    TANK_BOMBER:          0x0201,
    TANK_MONSTER:         0x0202,
    TANK_NASTY:           0x0203,
    TANK_SNIPER:          0x0204,
    TANK_SHOTGUN:         0x0205,
    TANK_MORTAR:          0x0206,
    TANK_TESLA:           0x0207
}

export default class ClientEntity {

	static types = new Map<number, (model: EntityModel) => void>()

    static configureEntity(model: Entity) {
        model.addComponent(new ServerPosition())
        model.addComponent(new EntityStateReceiver())
        model.addComponent(new EffectReceiver())
        model.addComponent(new PositionReceiver())
        model.addComponent(new HealthReceiver())
        model.addComponent(new CollisionIgnoreListReceiver())
    }

    static associate(type: number, configureFunction: (model: EntityModel) => void) {
        this.types.set(type, configureFunction)
    }
}