import EdgedBlockDrawer from '../edged-block-drawer';

export default class WoodBlockDrawer extends EdgedBlockDrawer {

    id = 3

    constructor() {
        super();

        this.spritePath = []

        for (let i = 0; i <= 17; i++) {
            this.spritePath.push("blocks/wood/variant-" + i)
        }
    }
}