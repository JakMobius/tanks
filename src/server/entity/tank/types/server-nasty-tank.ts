
import ServerTank, {ServerTankConfig} from "../servertank";
import WeaponMiner from "src/weapon/models/miner";
import FlamethrowerWeapon from "../../../../weapon/models/flamethrower";
import NastyTankModel from "../../../../entity/tanks/models/nasty-tank-model";

export default class ServerNastyTank extends ServerTank<NastyTankModel> {
    static Model = NastyTankModel
    private primaryWeapon: FlamethrowerWeapon;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig<NastyTankModel>) {
        super(options);

        this.primaryWeapon = new FlamethrowerWeapon({
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