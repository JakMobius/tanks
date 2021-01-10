import Weapon, {WeaponConfig} from '../weapon';
import Bullet16mm from '../../entity/bullet/models/16mm';

class WeaponMachineGun extends Weapon {
	public state: any;

	constructor(config: WeaponConfig) {
		config = Object.assign({
			maxAmmo: 50,
			shootRate: 100,
			reloadTime: 5000,
			bulletType: Bullet16mm,
		}, config)
		super(config)

		this.state = 0
		this.id = 4
	}

	shoot() {
		let tank = this.tank
		let position = tank.model.body.GetPosition()

		const shift = (this.state === 0) ? -1.4 : 1.4;

		this.launchBullet(tank,
			position.x + tank.model.matrix.cos * shift - tank.model.matrix.sin * shift,
			position.y + tank.model.matrix.sin * shift + tank.model.matrix.cos * shift
		)

		this.state = 1 - this.state

		this.popBullet()
	}
}

export default WeaponMachineGun;
