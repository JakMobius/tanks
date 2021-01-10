
import EdgedBlockDrawer from '../edgedblockdrawer';
import MapDrawer from '../../mapdrawer';

class BrickBlockDrawer extends EdgedBlockDrawer {

    id = 1

    constructor() {
        super();

        this.spritePath = "blocks/brick"
    }
}

export default BrickBlockDrawer;