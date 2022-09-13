import SingleBarreledWeapon from "../single-barreled-weapon";
import * as Box2D from "src/library/box2d"
import {WeaponConfig} from "../weapon";
import {EntityType} from "src/entity/entity-type";

export default class WeaponMiner extends SingleBarreledWeapon {
    constructor(config: WeaponConfig) {
        super({
            maxAmmo: 1,
            shootRate: 100,
            reloadTime: 100,
            bulletType: EntityType.BULLET_MINE,
            muzzlePoint: new Box2D.Vec2(0, 0),
            tank: config.tank,
            triggerAxle: config.triggerAxle
        });
    }
}
