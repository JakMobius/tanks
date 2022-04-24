import ClientEntity from '../client-entity';
import Entity from "../../../utils/ecs/entity";

export default class ClientBullet extends ClientEntity {
    static configureEntity(entity: Entity) {
        ClientEntity.configureEntity(entity)
    }
}
