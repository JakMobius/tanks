import Weapon, {WeaponConfig} from '../weapon';
import CannonBall from '../../entity/bullet/models/cannonball';

class WeaponCannon extends Weapon {
	constructor(config: WeaponConfig) {
		config = Object.assign({
			maxAmmo: 5,
			shootRate: 2000,
			reloadTime: 7000,
			bulletType: CannonBall
		}, config)

		super(config);

		this.id = 2
	}
}

export default WeaponCannon;