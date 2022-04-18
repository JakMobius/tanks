import Weapon, {WeaponConfig} from './weapon';

class Stungun extends Weapon {
    constructor(config: WeaponConfig) {
        super(config)
    }

    readyFraction() {
        return 1
    }

    clone() {
        return new Stungun(this)
    }
}

export default Stungun;