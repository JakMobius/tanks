
import Weapon42mm from "src/weapon/models/42mm";
import WeaponMiner from "src/weapon/models/miner";
import TankControls from "../../../controls/tank-controls";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerEntity from "../server-entity";

ServerEntity.types.set(EntityType.TANK_SNIPER, (entity: EntityModel) => {
    EntityModel.Types.get(EntityType.TANK_SNIPER)(entity)
    ServerEntity.setupEntity(entity)

    const controlsComponent = entity.getComponent(TankControls)

    // TODO: Organize weapons via some kind of weapon controller, i guess?

    let primaryWeapon = new Weapon42mm({
        tank: entity,
        triggerAxle: controlsComponent.getPrimaryWeaponAxle()
    })

    let minerWeapon = new WeaponMiner({
        tank: entity,
        triggerAxle: controlsComponent.getMinerWeaponAxle()
    })

    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.TANK_SNIPER)

    entity.on("tick", (dt) => {
        primaryWeapon.tick(dt)
        minerWeapon.tick(dt)
    })
})