
import EdgedBlockDrawer from '../edgedblockdrawer';
import MapDrawer from '../../mapdrawer';

class ConcreteBlockDrawer extends EdgedBlockDrawer {
    constructor() {
        super();

        this.spritePath = "blocks/concrete"
    }
}

MapDrawer.registerBlockLoader(2, new ConcreteBlockDrawer())

export default ConcreteBlockDrawer;