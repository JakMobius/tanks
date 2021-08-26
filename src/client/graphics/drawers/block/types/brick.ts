
import EdgedBlockDrawer from '../edged-block-drawer';

class BrickBlockDrawer extends EdgedBlockDrawer {

    id = 1

    constructor() {
        super();

        this.spritePath = "blocks/brick"
    }
}

export default BrickBlockDrawer;