
const BlockState = require("../blockstate")
const BinaryOptions = require("../../../binaryoptions")

class AirBinaryOptions extends BinaryOptions {
    convertOptions(encoder, options, flags) {}
    convertBinary(decoder, options) {}
}

class AirBlockState extends BlockState {

    // Empty options
    static BinaryOptions = new AirBinaryOptions()
    static isSolid = false;
    static typeName = "air";
    static typeId = 0;

    update(map, x, y) { }
}

BlockState.registerBlockStateClass(AirBlockState)

module.exports = AirBlockState