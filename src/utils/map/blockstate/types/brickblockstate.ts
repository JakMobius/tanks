
import BlockState from '../blockstate';

class BrickBlockState extends BlockState {
    static health = 3000
    static typeName = "brick";
    static typeId = 1;
}

BlockState.registerBlockStateClass(BrickBlockState)

export default BrickBlockState;