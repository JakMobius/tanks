
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerBullet from "../server-bullet";
import ServerEntity from "../server-entity";

ServerEntity.types.set(EntityType.BULLET_MINE, (entity: EntityModel) => {
    ServerBullet.setupEntity(entity)
    // this.startVelocity = 150
    // this.explodePower = 0
    // this.wallDamage = 7600
})