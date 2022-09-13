import {WeaponConfig} from '../weapon';
import * as Box2D from "src/library/box2d";
import SingleBarreledWeapon from "../single-barreled-weapon";
import {EntityType} from "src/entity/entity-type";

export default class WeaponMortar extends SingleBarreledWeapon {
	constructor(config: WeaponConfig) {
		super({
			maxAmmo: 5,
			shootRate: 1000,
			reloadTime: 5000,
			bulletType: EntityType.BULLET_MORTAR_BALL,
			muzzlePoint: new Box2D.Vec2(0, 1.25),
			tank: config.tank,
			triggerAxle: config.triggerAxle
		});
	}
}
