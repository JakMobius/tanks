
import EdgedBlockDrawer from '../edgedblockdrawer';

class ConcreteBlockDrawer extends EdgedBlockDrawer {

    id = 2

    constructor() {
        super();

        this.spritePath = "blocks/concrete"
    }
}

export default ConcreteBlockDrawer;