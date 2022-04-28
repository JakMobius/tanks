
import SingleBarreledWeapon from "../single-barreled-weapon";
import * as Box2D from "../../library/box2d"
import {WeaponConfig} from "../weapon";
import {EntityType} from "../../client/entity/client-entity";

export default class Weapon42mm extends SingleBarreledWeapon {
	constructor(config: WeaponConfig) {
		super({
			maxAmmo: 5,
			shootRate: 300,
			reloadTime: 300,
			bulletType: EntityType.BULLET_42MM,
			muzzlePoint: new Box2D.Vec2(0, 2.5),
			tank: config.tank,
			triggerAxle: config.triggerAxle
		});
	}
}