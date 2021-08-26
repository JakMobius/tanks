
import BlockState from '../block-state';
import BinaryOptions from '../../../utils/binary-options';
import BinaryEncoder from "../../../serialization/binary/binary-encoder";
import BinaryDecoder from "../../../serialization/binary/binary-decoder";
import GameMap from "../../game-map";

class AirBinaryOptions extends BinaryOptions {
    convertOptions(encoder: BinaryEncoder, options: any, flags: number[]) {}
    convertBinary(decoder: BinaryDecoder, options?: any) {}
}

export default class AirBlockState extends BlockState {

    // Empty options
    static BinaryOptions = new AirBinaryOptions()
    static isSolid = false;
    static typeName = "air";
    static typeId = 0;

    update(map: GameMap, x: number, y: number) { }
}