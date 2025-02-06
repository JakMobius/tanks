import "textures/blocks/brick/%.texture.png"
import EdgedBlockDrawer from '../edged-block-drawer';

export default class BrickBlockDrawer extends EdgedBlockDrawer {

    id = 1

    constructor() {
        super();

        this.spritePath = "blocks/brick"
    }
}