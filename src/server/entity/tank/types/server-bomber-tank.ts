import SniperTankModel from "src/entity/tanks/models/sniper-tank-model";
import ServerTank, {ServerTankConfig} from "../server-tank";
import WeaponMiner from "src/weapon/models/miner";
import BomberTankModel from "../../../../entity/tanks/models/bomber-tank-model";
import WeaponBomber from "../../../../weapon/models/bomber";
import TankControls from "../../../../controls/tank-controls";

export default class ServerBomberTank extends ServerTank {
    static Model = BomberTankModel
    private primaryWeapon: WeaponBomber;
    private minerWeapon: WeaponMiner;

    constructor(options: ServerTankConfig) {
        super(options);

        const controlsComponent = this.model.getComponent(TankControls)

        this.primaryWeapon = new WeaponBomber({
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