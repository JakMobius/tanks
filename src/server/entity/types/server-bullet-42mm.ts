
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerBullet from "../server-bullet";
import ServerEntity from "../server-entity";

ServerEntity.types.set(EntityType.BULLET_42MM, (entity: EntityModel) => {
    ServerBullet.setupEntity(entity)
    // this.wallDamage = 3000
    // this.startVelocity = 112.5
    // this.explodePower = 5
})