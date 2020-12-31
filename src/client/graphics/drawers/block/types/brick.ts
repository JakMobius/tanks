
import EdgedBlockDrawer from '../edgedblockdrawer';
import MapDrawer from '../../mapdrawer';

class BrickBlockDrawer extends EdgedBlockDrawer {
    constructor() {
        super();

        this.spritePath = "blocks/brick"
    }
}

MapDrawer.registerBlockLoader(1, new BrickBlockDrawer())

export default BrickBlockDrawer;