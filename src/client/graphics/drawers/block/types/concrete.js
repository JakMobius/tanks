
const EdgedBlockDrawer = require("../edgedblockdrawer")
const MapDrawer = require("../../mapdrawer")

class ConcreteBlockDrawer extends EdgedBlockDrawer {
    constructor() {
        super();

        this.spritePath = "blocks/concrete"
    }
}

MapDrawer.registerBlockLoader(2, new ConcreteBlockDrawer())

module.exports = ConcreteBlockDrawer