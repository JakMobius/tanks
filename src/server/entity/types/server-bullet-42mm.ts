
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerBullet from "../server-bullet";
import ServerEntity from "../server-entity";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";

ServerEntity.types.set(EntityType.BULLET_42MM, (entity: EntityModel) => {
    ServerBullet.setupEntity(entity)

    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.BULLET_42MM)
    // this.wallDamage = 3000
    // this.startVelocity = 112.5
    // this.explodePower = 5
})