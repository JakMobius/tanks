
const EdgedBlockDrawer = require("../edgedblockdrawer")
const MapDrawer = require("../../mapdrawer")

class BrickBlockDrawer extends EdgedBlockDrawer {
    constructor() {
        super();

        this.spritePath = "blocks/brick"
    }
}

MapDrawer.registerBlockLoader(1, new BrickBlockDrawer())

module.exports = BrickBlockDrawer