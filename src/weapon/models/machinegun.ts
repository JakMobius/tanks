import ReloadableWeapon from "../reloadable-weapon";
import {WeaponConfig} from "../weapon";
import {EntityType} from "src/entity/entity-type";

export default class WeaponMachineGun extends ReloadableWeapon {
	public state: number;

	constructor(config: WeaponConfig) {
		super({
			maxAmmo: 50,
			shootRate: 100,
			reloadTime: 5000,
			tank: config.tank,
			triggerAxle: config.triggerAxle
		})

		this.state = 0
	}

	shoot() {
		const shift = (this.state === 0) ? -0.35 : 0.35;

		this.launchBullet(EntityType.BULLET_16MM, shift, 2.5)

		this.state = 1 - this.state

		this.popBullet()
	}
}
