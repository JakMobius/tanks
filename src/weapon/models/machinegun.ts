
import Bullet16mm from '../../entity/bullets/models/16mm-bullet-model';
import ReloadableWeapon from "../reloadable-weapon";
import {WeaponConfig} from "../weapon";

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
		const shift = (this.state === 0) ? -1.4 : 1.4;

		this.launchBullet(new Bullet16mm(), shift, 10)

		this.state = 1 - this.state

		this.popBullet()
	}
}
