import Weapon, {WeaponConfig} from '../weapon';
import Mine from '../../entity/bullet/models/mine';

class WeaponMiner extends Weapon {
    constructor(config: WeaponConfig) {
        config = Object.assign({
            maxAmmo: 1,
            shootRate: 1000,
            reloadTime: 1000,
            bulletType: Mine,
        }, config)

        super(config);

        this.id = 5
    }
}

export default WeaponMiner;
