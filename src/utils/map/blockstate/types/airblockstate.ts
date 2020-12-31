
import BlockState from '../blockstate';
import BinaryOptions from '../../../binaryoptions';

class AirBinaryOptions extends BinaryOptions {
    convertOptions(encoder, options, flags) {}
    convertBinary(decoder, options?) {}
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

export default AirBlockState;