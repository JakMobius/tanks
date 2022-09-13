import SingleBarreledWeapon from "../single-barreled-weapon";
import * as Box2D from "src/library/box2d"
import {WeaponConfig} from "../weapon";
import {EntityType} from "src/entity/entity-type";

export default class WeaponCannon extends SingleBarreledWeapon {
	constructor(config: WeaponConfig) {
		super({
			maxAmmo: 5,
			shootRate: 2000,
			reloadTime: 7000,
			bulletType: EntityType.BULLET_CANNONBALL,
			muzzlePoint: new Box2D.Vec2(0, 2.5),
			tank: config.tank,
			triggerAxle: config.triggerAxle
		})
	}
}