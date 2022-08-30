
import SingleBarreledWeapon from "../single-barreled-weapon";
import * as Box2D from "../../library/box2d"
import {WeaponConfig} from "../weapon";
import {EntityType} from "../../entity/entity-type";

export default class WeaponBomber extends SingleBarreledWeapon {
	constructor(config: WeaponConfig) {
		super({
			maxAmmo: 5,
			shootRate: 1000,
			reloadTime: 5000,
			bulletType: EntityType.BULLET_BOMB,
			muzzlePoint: new Box2D.Vec2(0, 2.5),
			tank: config.tank,
			triggerAxle: config.triggerAxle
		});
	}
}