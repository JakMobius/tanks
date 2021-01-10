
import BulletModel from '../bulletmodel';
import {BinarySerializer} from "../../../serialization/binary/serializable";

class BulletModel16mm extends BulletModel {
    static typeName = 4
}

BinarySerializer.register(BulletModel16mm)

export default BulletModel16mm;