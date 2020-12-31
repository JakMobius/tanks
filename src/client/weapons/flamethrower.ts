
import Weapon from './weapon';

class Flamethrower extends Weapon {
    constructor(config) {
        super(config)
    }

    readyFraction() {
        return 1
    }

    clone() {
        return new Flamethrower(this)
    }
}

export default Flamethrower;