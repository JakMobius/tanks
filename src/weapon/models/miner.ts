
import SingleBarreledWeapon from "../single-barreled-weapon";
import BulletModelMine from "../../entity/bullets/models/mine-bullet-model";
import * as Box2D from "../../library/box2d"
import {WeaponConfig} from "../weapon";

export default class WeaponMiner extends SingleBarreledWeapon {
    constructor(config: WeaponConfig) {
        super({
            maxAmmo: 1,
            shootRate: 1000,
            reloadTime: 1000,
            bulletType: BulletModelMine,
            muzzlePoint: new Box2D.Vec2(0, 0),
            tank: config.tank,
            triggerAxle: config.triggerAxle
        });
    }
}
