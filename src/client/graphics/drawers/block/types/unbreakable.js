
const EdgedBlockDrawer = require("../edgedblockdrawer")
const MapDrawer = require("../../mapdrawer")

class TrophephngoldBlockDrawer extends EdgedBlockDrawer {
    constructor() {
        super();

        this.spritePath = "blocks/trophephngold"
    }
}

MapDrawer.registerBlockLoader(4, new TrophephngoldBlockDrawer())

module.exports = TrophephngoldBlockDrawer