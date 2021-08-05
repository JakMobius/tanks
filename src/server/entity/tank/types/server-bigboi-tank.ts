import ServerTank, {ServerTankConfig} from "../servertank";
import BigBoiTankModel from "../../../../entity/tanks/models/bigboi-tank-model";
import WeaponMiner from "../../../../weapon/models/miner";
import WeaponCannon from "../../../../weapon/models/cannon";

export default class ServerBigboiTank extends ServerTank<BigBoiTankModel> {
    static Model = BigBoiTankModel
    private primaryWeapon: WeaponCannon;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig<BigBoiTankModel>) {
        super(options);

        this.primaryWeapon = new WeaponCannon({
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