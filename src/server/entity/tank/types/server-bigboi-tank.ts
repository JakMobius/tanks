import ServerTank, {ServerTankConfig} from "../server-tank";
import BigBoiTankModel from "../../../../entity/tanks/models/bigboi-tank-model";
import WeaponMiner from "../../../../weapon/models/miner";
import WeaponCannon from "../../../../weapon/models/cannon";
import TankControls from "../../../../controls/tank-controls";

export default class ServerBigboiTank extends ServerTank<BigBoiTankModel> {
    static Model = BigBoiTankModel
    private primaryWeapon: WeaponCannon;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig<BigBoiTankModel>) {
        super(options);

        const controlsComponent = this.model.getComponent(TankControls)

        this.primaryWeapon = new WeaponCannon({
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