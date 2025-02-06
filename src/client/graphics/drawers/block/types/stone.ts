import "textures/blocks/stone/%.texture.png"
import EdgedBlockDrawer from '../edged-block-drawer';

export default class StoneBlockDrawer extends EdgedBlockDrawer {

    id = 5

    constructor() {
        super();

        this.spritePath = "blocks/stone"
    }
}