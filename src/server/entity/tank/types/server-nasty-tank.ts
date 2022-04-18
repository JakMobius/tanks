import ServerTank, {ServerTankConfig} from "../server-tank";
import WeaponMiner from "src/weapon/models/miner";
import FlamethrowerWeapon from "../../../../weapon/models/flamethrower";
import NastyTankModel from "../../../../entity/tanks/models/nasty-tank-model";
import TankControls from "../../../../controls/tank-controls";

export default class ServerNastyTank extends ServerTank {
    static Model = NastyTankModel
    private primaryWeapon: FlamethrowerWeapon;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig) {
        super(options);

        const controlsComponent = this.model.getComponent(TankControls)

        this.primaryWeapon = new FlamethrowerWeapon({
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