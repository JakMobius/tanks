const BlockState = require("../blockstate")

class WoodBlockState extends BlockState {
    static health = 1500
    static typeName = "wood";
    static typeId = 3;

    constructor() {
        super();

        this.variant = Math.floor(Math.random() * 18)
    }
}

BlockState.registerBlockStateClass(WoodBlockState)

module.exports = WoodBlockState