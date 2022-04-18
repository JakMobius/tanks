import EdgedBlockDrawer from '../edged-block-drawer';

class StoneBlockDrawer extends EdgedBlockDrawer {

    id = 5

    constructor() {
        super();

        this.spritePath = "blocks/stone"
    }
}

export default StoneBlockDrawer;