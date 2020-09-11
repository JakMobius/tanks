
const EdgedBlockDrawer = require("../edgedblockdrawer")
const MapDrawer = require("../../mapdrawer")

class StoneBlockDrawer extends EdgedBlockDrawer {
    constructor() {
        super();

        this.spritePath = "blocks/stone"
    }
}

MapDrawer.registerBlockLoader(5, new StoneBlockDrawer())

module.exports = StoneBlockDrawer