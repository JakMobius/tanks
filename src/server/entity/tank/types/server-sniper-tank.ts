
import SniperTankModel from "src/entity/tanks/models/sniper-tank-model";
import ServerTank, {ServerTankConfig} from "../server-tank";
import Weapon42mm from "src/weapon/models/42mm";
import WeaponMiner from "src/weapon/models/miner";

export default class ServerSniperTank extends ServerTank<SniperTankModel> {
    static Model = SniperTankModel
    private primaryWeapon: Weapon42mm;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig<SniperTankModel>) {
        super(options);

        this.primaryWeapon = new Weapon42mm({
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