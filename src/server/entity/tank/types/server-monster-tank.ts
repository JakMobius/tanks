
import ServerTank, {ServerTankConfig} from "../servertank";
import WeaponMiner from "src/weapon/models/miner";
import MonsterTankModel from "src/entity/tanks/models/monster-tank-model";
import WeaponMachineGun from "src/weapon/models/machinegun";

export default class ServerSniperTank extends ServerTank<MonsterTankModel> {
    static Model = MonsterTankModel
    private primaryWeapon: WeaponMachineGun;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig<MonsterTankModel>) {
        super(options);

        this.primaryWeapon = new WeaponMachineGun({
            tank: this,
            triggerAxle: this.model.controls.getPrimaryWeaponAxle()
        })

        this.minerWeapon = new WeaponMiner({
            tank: this,
            triggerAxle: this.model.controls.getMinerWeaponAxle()
        })
    }

    tick(dt: number): void {
        super.tick(dt)
        this.primaryWeapon.tick(dt)
        this.minerWeapon.tick(dt)
    }
}