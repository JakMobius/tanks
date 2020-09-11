
const EdgedBlockDrawer = require("../edgedblockdrawer")
const MapDrawer = require("../../mapdrawer")

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

module.exports = WoodBlockDrawer