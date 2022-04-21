import SniperTankModel from "src/entity/tanks/models/sniper-tank-model";
import ServerTank, {ServerTankConfig} from "../server-tank";
import Weapon42mm from "src/weapon/models/42mm";
import WeaponMiner from "src/weapon/models/miner";
import TankControls from "../../../../controls/tank-controls";
import EntityDataTransmitComponent
    from "../../../../entity/components/network/transmitting/entity-data-transmit-component";
import {EntityType} from "../../../../client/entity/client-entity";

export default class ServerSniperTank extends ServerTank {
    static Model = SniperTankModel
    private primaryWeapon: Weapon42mm;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig) {
        super(options);

        const controlsComponent = this.model.getComponent(TankControls)

        this.primaryWeapon = new Weapon42mm({
            tank: this,
            triggerAxle: controlsComponent.getPrimaryWeaponAxle()
        })

        this.minerWeapon = new WeaponMiner({
            tank: this,
            triggerAxle: controlsComponent.getMinerWeaponAxle()
        })

        this.model.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.TANK_SNIPER)
    }

    tick(dt: number): void {
        super.tick(dt)
        this.primaryWeapon.tick(dt)
        this.minerWeapon.tick(dt)
    }
}