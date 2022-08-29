import BlockState from '../block-state';
import GameMap from "../../game-map";
import BlockStateBinaryOptions from "../block-state-binary-options";

class AirBinaryOptions extends BlockStateBinaryOptions {

}

export default class AirBlockState extends BlockState {

    // Empty options
    static BinaryOptions = new AirBinaryOptions()
    static isSolid = false;
    static typeName = "air";
    static typeId = 0;

    update(map: GameMap, x: number, y: number) {
        map.emit("block-update", x, y)
    }
}