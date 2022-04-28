import ClientEntity from '../client-entity';
import Entity from "../../../utils/ecs/entity";
import HealthComponent from "../../../entity/components/health-component";

export default class ClientBullet extends ClientEntity {
    static configureEntity(entity: Entity) {
        ClientEntity.configureEntity(entity)
    }
}
