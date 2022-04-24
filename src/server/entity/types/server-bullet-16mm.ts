
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerBullet from "../server-bullet";
import ServerEntity from "../server-entity";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";

ServerEntity.types.set(EntityType.BULLET_16MM, (entity: EntityModel) => {
    ServerBullet.setupEntity(entity)

    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.BULLET_16MM)
    // this.startVelocity = 150
    // this.explodePower = 0
    // this.wallDamage = 1000
    // this.playerDamage = 0.5
})