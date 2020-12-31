import Weapon from '../weapon';
import BulletModel42mm from '../../entity/bullet/models/42mm';

class Weapon42mm extends Weapon {
	constructor(config) {
		config = Object.assign({
			maxAmmo: 5,
			shootRate: 1000,
			reloadTime: 5000,
			bulletType: BulletModel42mm
		}, config)

		super(config);
	}
}

export default Weapon42mm;