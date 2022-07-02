
import ClientEntity from "../client-entity";
import EffectHost from "../../../effects/effect-host";
import DamageSmokeEffect from "./damage-smoke-effect";
import Entity from "../../../utils/ecs/entity";

export default class ClientTank extends ClientEntity {
    static configureEntity(entity: Entity) {
        ClientEntity.configureEntity(entity)
        entity.getComponent(EffectHost).addEffect(new DamageSmokeEffect())
    }
}