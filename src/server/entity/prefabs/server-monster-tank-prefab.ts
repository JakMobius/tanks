import WeaponMiner from "src/weapon/models/miner";
import WeaponMachineGun from "src/weapon/models/machinegun";
import TankControls from "../../../controls/tank-controls";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import EntityPrefabs from "../../../entity/entity-prefabs";
import ServerEntityPrefabs from "../server-entity-prefabs";
import HealthComponent, {DamageModifiers, DamageTypes} from "../../../entity/components/health-component";
import ExplodeOnDeathComponent from "../../../entity/components/explode-on-death-component";
import {EntityType} from "../../../entity/entity-type";
import ServerEntityPilotListComponent from "../components/server-entity-pilot-list-component";

ServerEntityPrefabs.types.set(EntityType.TANK_MONSTER, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TANK_MONSTER)(entity)

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

    entity.on("tick", (dt) => {
        primaryWeapon.tick(dt)
        minerWeapon.tick(dt)
    })

    entity.addComponent(new ServerEntityPilotListComponent())
    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.TANK_MONSTER)
    entity.addComponent(new ExplodeOnDeathComponent())

    entity.getComponent(HealthComponent)
        .setMaxHealth(10)
        .addDamageModifier(DamageModifiers.resistance(1), DamageTypes.EXPLOSION)
})