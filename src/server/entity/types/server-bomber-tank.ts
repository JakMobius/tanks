
import WeaponMiner from "src/weapon/models/miner";
import WeaponBomber from "../../../weapon/models/bomber";
import TankControls from "../../../controls/tank-controls";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerEntity from "../server-entity";
import HealthComponent, {DamageModifiers, DamageTypes} from "../../../entity/components/health-component";

ServerEntity.types.set(EntityType.TANK_BOMBER, (entity: EntityModel) => {
    ServerEntity.setupEntity(entity)
    EntityModel.Types.get(EntityType.TANK_BOMBER)(entity)

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

    entity.getComponent(HealthComponent)
        .setMaxHealth(10)
        .addDamageModifier(DamageModifiers.resistance(1), DamageTypes.EXPLOSION)
})