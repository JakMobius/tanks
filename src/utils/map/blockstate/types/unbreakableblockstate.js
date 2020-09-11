const BlockState = require("../blockstate")

class TrophephngoldBlockState extends BlockState {
    static health = Infinity
    static typeName = "trophephngold";
    static typeId = 4;
}

BlockState.registerBlockStateClass(TrophephngoldBlockState)

module.exports = TrophephngoldBlockState