
import WeaponMiner from "src/weapon/models/miner";
import WeaponMachineGun from "src/weapon/models/machinegun";
import TankControls from "../../../controls/tank-controls";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import EntityDataEncoder from "../entity-data-encoder";
import ServerEntity from "../server-entity";

ServerEntity.types.set(EntityType.TANK_MONSTER, (entity: EntityModel) => {
    ServerEntity.setupEntity(entity)

    entity.addComponent(new EntityDataEncoder())

    const controlsComponent = entity.getComponent(TankControls)

    // TODO: Organize weapons via some kind of weapon controller, i guess?

    const primaryWeapon = new WeaponMachineGun({
        tank: entity,
        triggerAxle: controlsComponent.getPrimaryWeaponAxle()
    })

    const minerWeapon = new WeaponMiner({
        tank: entity,
        triggerAxle: controlsComponent.getMinerWeaponAxle()
    })

    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.TANK_MONSTER)

    entity.on("tick", (dt) => {
        primaryWeapon.tick(dt)
        minerWeapon.tick(dt)
    })
})