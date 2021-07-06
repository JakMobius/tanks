
import EdgedBlockDrawer from '../edgedblockdrawer';

class StoneBlockDrawer extends EdgedBlockDrawer {

    id = 5

    constructor() {
        super();

        this.spritePath = "blocks/stone"
    }
}

export default StoneBlockDrawer;