
import WeaponMiner from "src/weapon/models/miner";
import WeaponBomber from "../../../weapon/models/bomber";
import TankControls from "../../../controls/tank-controls";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerEntity from "../server-entity";

ServerEntity.types.set(EntityType.TANK_BOMBER, (entity: EntityModel) => {
    EntityModel.Types.get(EntityType.TANK_BOMBER)(entity)
    ServerEntity.setupEntity(entity)

    const controlsComponent = entity.getComponent(TankControls)

    // TODO: Organize weapons via some kind of weapon controller, i guess?

    const primaryWeapon = new WeaponBomber({
        tank: entity,
        triggerAxle: controlsComponent.getPrimaryWeaponAxle()
    })

    const minerWeapon = new WeaponMiner({
        tank: entity,
        triggerAxle: controlsComponent.getMinerWeaponAxle()
    })

    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.TANK_BOMBER)

    entity.on("tick", (dt) => {
        primaryWeapon.tick(dt)
        minerWeapon.tick(dt)
    })
})