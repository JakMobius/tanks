import Weapon from '../weapon';
import MortarBall from '../../entity/bullet/models/mortarball';

class WeaponMortar extends Weapon {
	constructor(config) {
		config = Object.assign({
			maxAmmo: 5,
			shootRate: 1000,
			reloadTime: 5000,
			bulletType: MortarBall,
		}, config)

		super(config);

		this.id = 6
	}
}

export default WeaponMortar;
