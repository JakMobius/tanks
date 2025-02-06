import "textures/blocks/concrete/%.texture.png"
import EdgedBlockDrawer from '../edged-block-drawer';

export default class ConcreteBlockDrawer extends EdgedBlockDrawer {

    id = 2

    constructor() {
        super();

        this.spritePath = "blocks/concrete"
    }
}