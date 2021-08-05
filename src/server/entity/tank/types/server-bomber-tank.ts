

import SniperTankModel from "src/entity/tanks/models/sniper-tank-model";
import ServerTank, {ServerTankConfig} from "../servertank";
import WeaponMiner from "src/weapon/models/miner";
import BomberTankModel from "../../../../entity/tanks/models/bomber-tank-model";
import WeaponBomber from "../../../../weapon/models/bomber";

export default class ServerBomberTank extends ServerTank<BomberTankModel> {
    static Model = BomberTankModel
    private primaryWeapon: WeaponBomber;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig<SniperTankModel>) {
        super(options);

        this.primaryWeapon = new WeaponBomber({
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