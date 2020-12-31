
import EdgedBlockDrawer from '../edgedblockdrawer';
import MapDrawer from '../../mapdrawer';

class TrophephngoldBlockDrawer extends EdgedBlockDrawer {
    constructor() {
        super();

        this.spritePath = "blocks/trophephngold"
    }
}

MapDrawer.registerBlockLoader(4, new TrophephngoldBlockDrawer())

export default TrophephngoldBlockDrawer;