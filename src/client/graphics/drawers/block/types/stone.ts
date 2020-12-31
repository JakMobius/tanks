
import EdgedBlockDrawer from '../edgedblockdrawer';
import MapDrawer from '../../mapdrawer';

class StoneBlockDrawer extends EdgedBlockDrawer {
    constructor() {
        super();

        this.spritePath = "blocks/stone"
    }
}

MapDrawer.registerBlockLoader(5, new StoneBlockDrawer())

export default StoneBlockDrawer;