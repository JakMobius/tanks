
import {Constructor} from "../../../serialization/binary/serializable";
import EntityModel, {EntityModelType} from "../../../entity/entity-model";
import Engine from "../../engine";
import ClientPlayer from "../../client-player";
import ClientEntity from "../client-entity";
import EffectHost from "../../../effects/effect-host";
import DamageSmokeEffect from "./damage-smoke-effect";
import Entity from "../../../utils/ecs/entity";

export type ClientTankType = Constructor<ClientTank> & {
    Model: Constructor<EntityModel> & EntityModelType
}

export default class ClientTank extends ClientEntity {
    static configureEntity(entity: Entity) {
        ClientEntity.configureEntity(entity)
        entity.getComponent(EffectHost).addEffect(new DamageSmokeEffect())
    }
}