import {WeaponConfig} from '../weapon';
import MortarBall from '../../entity/bullets/models/mortarball-bullet-model';
import * as Box2D from "../../library/box2d";
import SingleBarreledWeapon from "../single-barreled-weapon";

export default class WeaponMortar extends SingleBarreledWeapon {
	constructor(config: WeaponConfig) {
		super({
			maxAmmo: 5,
			shootRate: 1000,
			reloadTime: 5000,
			bulletType: MortarBall,
			muzzlePoint: new Box2D.Vec2(0, 1.25),
			tank: config.tank,
			triggerAxle: config.triggerAxle
		});
	}
}
