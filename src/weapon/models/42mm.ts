import BulletModel42mm from '../../entity/bullets/models/42mm-bullet-model';
import SingleBarreledWeapon from "../single-barreled-weapon";
import * as Box2D from "../../library/box2d"
import {WeaponConfig} from "../weapon";

export default class Weapon42mm extends SingleBarreledWeapon {
	constructor(config: WeaponConfig) {
		super({
			maxAmmo: 5,
			shootRate: 1000,
			reloadTime: 5000,
			bulletType: BulletModel42mm,
			muzzlePoint: new Box2D.Vec2(0, 2.5),
			tank: config.tank,
			triggerAxle: config.triggerAxle
		});
	}
}