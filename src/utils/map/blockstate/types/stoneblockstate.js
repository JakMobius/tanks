
const BlockState = require("../blockstate")

class StoneBlockState extends BlockState {
    static health = 7500
    static typeName = "stone";
    static typeId = 5;
}

BlockState.registerBlockStateClass(StoneBlockState)

module.exports = StoneBlockState