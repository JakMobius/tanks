
import ClientEntity from "../client-entity";
import EffectHostComponent from "../../../effects/effect-host-component";
import DamageSmokeEffect from "./damage-smoke-effect";
import Entity from "../../../utils/ecs/entity";

export default class ClientTank extends ClientEntity {
    static configureEntity(entity: Entity) {
        ClientEntity.configureEntity(entity)
        entity.getComponent(EffectHostComponent).addEffect(new DamageSmokeEffect())
    }
}