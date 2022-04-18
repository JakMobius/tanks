import ServerTank, {ServerTankConfig} from "../server-tank";
import WeaponMiner from "src/weapon/models/miner";
import MonsterTankModel from "src/entity/tanks/models/monster-tank-model";
import WeaponMachineGun from "src/weapon/models/machinegun";
import TankControls from "../../../../controls/tank-controls";

export default class ServerSniperTank extends ServerTank {
    static Model = MonsterTankModel
    private primaryWeapon: WeaponMachineGun;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig) {
        super(options);

        const controlsComponent = this.model.getComponent(TankControls)

        this.primaryWeapon = new WeaponMachineGun({
            tank: this,
            triggerAxle: controlsComponent.getPrimaryWeaponAxle()
        })

        this.minerWeapon = new WeaponMiner({
            tank: this,
            triggerAxle: controlsComponent.getMinerWeaponAxle()
        })
    }

    tick(dt: number): void {
        super.tick(dt)
        this.primaryWeapon.tick(dt)
        this.minerWeapon.tick(dt)
    }
}