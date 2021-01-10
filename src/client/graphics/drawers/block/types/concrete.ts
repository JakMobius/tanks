
import EdgedBlockDrawer from '../edgedblockdrawer';
import MapDrawer from '../../mapdrawer';

class ConcreteBlockDrawer extends EdgedBlockDrawer {

    id = 2

    constructor() {
        super();

        this.spritePath = "blocks/concrete"
    }
}

export default ConcreteBlockDrawer;