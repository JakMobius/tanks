
import CannonBall from '../../entity/bullets/models/cannonball-bullet-model';
import SingleBarreledWeapon from "../single-barreled-weapon";
import * as Box2D from "../../library/box2d"
import {WeaponConfig} from "../weapon";

export default class WeaponCannon extends SingleBarreledWeapon {
	constructor(config: WeaponConfig) {
		super({
			maxAmmo: 5,
			shootRate: 2000,
			reloadTime: 7000,
			bulletType: CannonBall,
			muzzlePoint: new Box2D.Vec2(0, 10),
			tank: config.tank,
			triggerAxle: config.triggerAxle
		})
	}
}