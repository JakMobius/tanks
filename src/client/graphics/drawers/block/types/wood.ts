
import EdgedBlockDrawer from '../edgedblockdrawer';
import MapDrawer from '../../mapdrawer';

class WoodBlockDrawer extends EdgedBlockDrawer {
    constructor() {
        super();

        this.spritePath = []

        for (let i = 0; i <= 17; i++) {
            this.spritePath.push("blocks/wood/variant-" + i)
        }
    }
}

MapDrawer.registerBlockLoader(3, new WoodBlockDrawer())

export default WoodBlockDrawer;