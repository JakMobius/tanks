
import BlockState from '../blockstate';
import BinaryOptions from '../../../binaryoptions';
import BinaryEncoder from "../../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../../serialization/binary/binarydecoder";
import GameMap from "../../gamemap";

class AirBinaryOptions extends BinaryOptions {
    convertOptions(encoder: BinaryEncoder, options: any, flags: number[]) {}
    convertBinary(decoder: BinaryDecoder, options?: any) {}
}

class AirBlockState extends BlockState {

    // Empty options
    static BinaryOptions = new AirBinaryOptions()
    static isSolid = false;
    static typeName = "air";
    static typeId = 0;

    update(map: GameMap, x: number, y: number) { }
}

export default AirBlockState;