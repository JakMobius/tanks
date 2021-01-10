
import EdgedBlockDrawer from '../edgedblockdrawer';
import MapDrawer from '../../mapdrawer';

class StoneBlockDrawer extends EdgedBlockDrawer {

    id = 5

    constructor() {
        super();

        this.spritePath = "blocks/stone"
    }
}

export default StoneBlockDrawer;