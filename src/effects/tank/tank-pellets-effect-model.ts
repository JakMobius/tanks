import TankEffectModel from "./tankeffectmodel";;
import {BinarySerializer} from 'src/serialization/binary/serializable';

class TankPelletsEffectModel extends TankEffectModel {
    static typeName = 2
}

export default TankPelletsEffectModel;