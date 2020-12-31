import BlockState from '../blockstate';

class TrophephngoldBlockState extends BlockState {
    static health = Infinity
    static typeName = "trophephngold";
    static typeId = 4;
}

BlockState.registerBlockStateClass(TrophephngoldBlockState)

export default TrophephngoldBlockState;